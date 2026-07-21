import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import { supabase } from '../config/supabaseClient.js';


// route 1 : Endpoint called when the user clicks "Send recording" (or "Upload recording").
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const { titre, description, type_mode } = req.body; // 'presentiel', 'distanciel', 'hybride'

    if (!file) return res.status(400).json({ error: 'Fichier audio manquant.' });

    // A. Générer un ID unique pour la réunion
    const fileName = `${Date.now()}_${file.originalname}`;
    const storagePath = `reunions/${fileName}`;

    // B. Téléverser le fichier dans Supabase Storage ('reunions-audio')
    const { data: storageData, error: storageError } = await supabase.storage
      .from('reunions-audio')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (storageError) throw storageError;

    // Obtenir l'URL publique ou signée du fichier
    const { data: urlData } = supabase.storage
      .from('reunions-audio')
      .getPublicUrl(storagePath);

    const audioUrl = urlData.publicUrl;

    // C. Insérer la réunion en BDD avec le statut 'en_attente'
    const { data: reunion, error: reunionError } = await supabase
      .from('reunions')
      .insert([
        {
          titre: titre || 'Réunion sans titre',
          description: description || '',
          type_mode: type_mode || 'presentiel',
          statut: 'en_attente',
        },
      ])
      .select()
      .single();

    if (reunionError) throw reunionError;

    // D. Enregistrer la référence dans la table 'fichiers_audio' (Pour traçabilité RGPD)
    await supabase.from('fichiers_audio').insert([
      {
        reunion_id: reunion.id,
        chemin_storage: storagePath,
        est_purge: false,
      },
    ]);

    // E. Déclencher le Workflow n8n via le Webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reunion_id: reunion.id,
        audio_url: audioUrl,
      }),
    });

    return res.status(201).json({
      message: 'Réunion créée et traitement IA démarré.',
      reunion_id: reunion.id,
      statut: 'en_attente',
    });

  } catch (error) {
    console.error('Erreur Upload:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;