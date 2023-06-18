from weather_api_service import db, secret_key, encrypt, decrypt
from weather_api_service.models.User import User


def validate_user_credentials(user_name: str, password: str) -> (int, str, dict):
    status = 401
    message = 'Incorrect username or password'
    user = None
    try:
        user_obj = (
            db.session.query(User)
            .filter(User.username == user_name)
            .first()
        )
        if user_obj:
            entered_password_enc = encrypt(secret_key=secret_key, plain_text=password)
            if entered_password_enc == user_obj.password:
                status = 200
                message = 'User successfully authenticated'
                user = {
                    'user_name': user_obj.username, 'first_name': user_obj.full_name
                }
        else:
            message = 'Invalid username or password'
            status = 500
    except Exception as e:
        message = str(e)
        status = 500

    return status, message, user
