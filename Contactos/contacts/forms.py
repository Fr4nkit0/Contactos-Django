from django.forms import ModelForm
from .models import Contact
from django import forms
from django import forms
import re


def solo_caracteres(value):
    """
    Valida que el valor no contenga números.

    **Args:**
        - `value` (str): El valor del campo a validar.

    **Return:**
        - Ninguno. Si el valor contiene números, se lanza una excepción `ValidationError`.

    **Raises:**
        - `forms.ValidationError`: Si el valor contiene números, se lanza un error de validación.
    """
    if any(char.isdigit() for char in value):
        raise forms.ValidationError(
            'El nombre no puede contener números: %(valor)s. Por favor, ingrese solo caracteres.',
            code='invalid',
            params={'valor': value}
        )


def custom_validate_email(value):
    """
    Valida que la parte local del correo (antes del '@') tenga caracteres válidos y que el correo tenga el dominio '@gmail.com'.

    **Args:**
        - `value` (str): El valor del campo de correo electrónico a validar.

    **Return:**
        - Ninguno. Si el correo no cumple con las validaciones, se lanza una excepción `ValidationError`.

    **Raises:**
        - `forms.ValidationError`: Si la parte local del correo contiene caracteres inválidos o si el correo no tiene el dominio '@gmail.com'.
    """
    # Primera validación: Verificar un patrón adicional (modifícalo según tus necesidades)
    additional_regex = r'^[a-zA-Z0-9._]+$'
    local_part = value.split('@')[0]  # Obtén la parte local antes del '@'
    if not re.match(additional_regex, local_part):
        raise forms.ValidationError(
            'La parte local del correo (antes de @) contiene caracteres inválidos: %(valor)s.',
            code='invalid_local',
            params={'valor': local_part}
        )
    # Segunda validación: Verificar que el correo sea de Gmail
    email_regex = r'^[a-zA-Z0-9._]+@gmail\.com$'  # Solo verifica el dominio
    # Cambiamos a search para buscar la coincidencia en cualquier parte del correo
    if not re.search(email_regex, value):
        raise forms.ValidationError(
            'El correo electrónico debe tener el dominio "@gmail.com". Por favor, ingrese un correo válido.',
            code='invalid_gmail',
            params={'valor': value}
        )


def validate_phone(value):
    """
    Valida que el número de teléfono tenga el formato correcto y comience con el prefijo '+54 9'.

    **Args:**
        - `value` (str): El valor del campo de teléfono a validar.

    **Return:**
        - Ninguno. Si el teléfono no cumple con las validaciones, se lanza una excepción `ValidationError`.

    **Raises:**
        - `forms.ValidationError`: Si el teléfono no tiene el formato correcto o no empieza con '+54 9', se lanza un error de validación.
    """
    if len(value) != 18:
        raise forms.ValidationError(
            'El teléfono debe estar en el formato +54 9 XXX XXX-XXXX.',
            code='invalid_phone'
        )
    # Primero validamos que comience con "+54 9"
    if not value.startswith('+54 9'):
        raise forms.ValidationError(
            'El teléfono debe comenzar con "+54 9".',
            code='invalid_phone'
        )

    # Luego validamos que el formato tenga los primeros tres dígitos (después de "+54 9")
    # seguido de un espacio
    middle_section = value[5:].strip()  # Tomamos el resto después de "+54 9"
    print(middle_section)
    len(middle_section)
    if not re.match(r'^\d{3} \d{3}-\d{4}$', middle_section):
        raise forms.ValidationError(
            'El teléfono debe tener el formato "+54 9 XXX XXX-XXXX" y ser numeros.',
            code='invalid_phone'
        )


class ContactForm(ModelForm):
    """
    Formulario para crear o actualizar un contacto.

    **Args:**
        - Ninguno. Los campos del formulario son definidos por los atributos de la clase.

    **Return:**
        - Un formulario de contacto validado y guardado (si es válido).
    """
    name = forms.CharField(
        label="Nombre",
        max_length=25,
        validators=(solo_caracteres,),
        widget=forms.TextInput(
            attrs={'class': 'form-control', 'placeholder': 'Ingrese el nombre'}),
        error_messages={
            'required': 'El nombre es obligatorio.',
            'max_length': 'El nombre no puede tener más de 25 caracteres.',
        }
    )
    phone = forms.CharField(
        label="Teléfono",
        max_length=18,
        validators=(validate_phone,),
        widget=forms.TextInput(
            attrs={'class': 'form-control',  'placeholder': 'Ingrese el Teléfono'}),
        error_messages={
            'required': 'El Telefono es obligatorio.',
            'max_length': 'El Numero de telefono no puede pasar los 18 caracteres.',
        }
    )
    email = forms.EmailField(
        label="Correo Electrónico",
        max_length=254,
        validators=(custom_validate_email,),
        widget=forms.EmailInput(
            attrs={'class': 'form-control', 'placeholder': 'Ingrese el Email'}),
        error_messages={
            'required': 'El Email es obligatorio.',
            'max_length': 'El Email no puede pasar los 255 caracteres.',
        }
    )

    class Meta:
        model = Contact
        fields = '__all__'
