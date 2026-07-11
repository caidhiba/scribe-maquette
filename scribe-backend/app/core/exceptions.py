from fastapi import HTTPException, status

def not_found(msg="Ressource introuvable"): return HTTPException(status.HTTP_404_NOT_FOUND, msg)
def forbidden(msg="Accès refusé"): return HTTPException(status.HTTP_403_FORBIDDEN, msg)
def bad_request(msg="Requête invalide"): return HTTPException(status.HTTP_400_BAD_REQUEST, msg)
def unauthorized(msg="Non authentifié"): return HTTPException(status.HTTP_401_UNAUTHORIZED, msg)
