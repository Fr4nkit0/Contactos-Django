import re


def custom_validate_email(value):
    """
    Valida que la parte local del correo (antes del '@') tenga caracteres válidos y que el correo tenga el dominio '@gmail.com'.
    """
    if not value:
        raise ValueError('El correo electrónico no puede estar vacío.')
    additional_regex = r'^[a-zA-Z0-9._]+$'
    local_part = value.split('@')[0]
    if not re.match(additional_regex, local_part):
        raise ValueError(
            'La parte local del correo (antes de @) contiene caracteres inválidos.'
        )

    # Expresión regular para validar el formato general del correo
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.search(email_regex, value):
        raise ValueError(
            'El correo electrónico no tiene un formato válido.'
        )


def validate_phone(value):
    """
    Valida que el número de teléfono que comienze con '+'
    seguido únicamente por dígitos.
    Ejemplo válido: +5491123456789, +14151234567
    """
    if not value:
        raise ValueError('El teléfono no puede estar vacío.')

    # Patrón para validar que empiece con + y solo tenga dígitos después
    pattern = re.compile(r'^\+\d+$')

    if not pattern.match(value):
        raise ValueError(
            'El teléfono debe contener solo números, por ejemplo: "+5491123456789".'
        )
