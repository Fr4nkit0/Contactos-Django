from django.shortcuts import render, get_object_or_404, redirect
from .models import Contact
from .forms import ContactForm
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import Http404
from django.db.models import Q, Value
from django.db.models.functions import Replace

import re
from django.views.decorators.cache import never_cache


@never_cache
def find_all(request):
    """
    Filtra los contactos según el término de búsqueda y los muestra en una página de resultados paginada.

    **Args:**
        - `request` (HttpRequest): El objeto de solicitud HTTP que contiene los parámetros de búsqueda y paginación.

    **Return:**
        - `HttpResponse`: La respuesta que renderiza la plantilla 'list_contacts.html' con los contactos paginados.

    **Raises:**
        - `Http404`: Si ocurre un error en la paginación (por ejemplo, si la página solicitada no existe).
        - 'Contact.ObjectDoesNotExist': Si no se encuentra los contactos
    """
    # Filtra los contactos por nombre o teléfono basándose en el parámetro 'search'.
    # Obtén el término de búsqueda
    search_query = request.GET.get('search', '')
    # Verificar si la query no está vacía ni contiene solo espacios
    if search_query.strip() and len(search_query) <= 30:
        # Usa expresiones regulares para separar los números y las letras
        # Consideramos que los números y letras están separados por espacios
        # Extrae solo las letras
        text_part = ''.join(re.findall(r'[a-zA-Z]+', search_query))
        # Extrae solo los números
        number_part = ''.join(re.findall(r'[+\d]+', search_query)).lstrip()
        # Crea una condición vacía para poder agregarle filtros
        query = Q()
        # Si hay texto, agrega el filtro para el nombre
        # Limpiar el campo `phone` para eliminar espacios y guiones, y el campo `name` para eliminar espacios
        try:
            contacts = Contact.objects.annotate(
                phone_cleaned=Replace(
                    # Eliminar espacios
                    Replace('phone', Value(' '), Value('')),
                    Value('-'), Value('')  # Eliminar guiones
                ),
                # Eliminar espacios en el nombre
                name_cleaned=Replace('name', Value(' '), Value(''))
            )
        except:
            messages.error(request, 'No se encontraron contactos')
            return redirect('find_all')
        # Si hay texto, agrega el filtro para el nombre
        if text_part and text_part.strip():
            query &= Q(name_cleaned__icontains=text_part)

        # Si hay números, agrega el filtro para el teléfono
        if number_part:
            query &= Q(phone_cleaned__icontains=number_part)
        if not query:
            try:
                # Si no hay términos de búsqueda, muestra todos los contactos
                contacts = Contact.objects.all().order_by('name')
            except:
                messages.error(request, 'No se encontraron contactos')
                return redirect('find_all')
        else:
            try:
                # Aplica el filtro a los contactos
                contacts = contacts.filter(query).order_by('name')
            except:
                messages.error(request, 'No se encontraron contactos')
                return redirect('find_all')

    else:
        try:
            contacts = Contact.objects.all().order_by('name')
            search_query = ""
        except:
            messages.error(request, 'No se encontraron contactos')
            return redirect('find_all')
    # Recupera el número de página desde la solicitud GET, por defecto es la página 1.
    page = request.GET.get('page', 1)
    try:
        # Paginación de los contactos: se muestran 3 contactos por página.
        paginator = Paginator(contacts, 6)
        # Obtiene los contactos para la página actual.
        contacts = paginator.page(page)
    except:
        messages.error(request, 'Pagina no encontrada')
        return redirect('find_all')
    return render(request, 'list_contacts.html', {'contacts': contacts, 'search_query': search_query})


@ never_cache
def find_by_id(request, contact_id):
    """
    Recupera un contacto por su ID y lo muestra en una plantilla de detalle.

    **Args:**
        - `request` (HttpRequest): El objeto de solicitud HTTP que contiene los datos de la solicitud.
        - `contact_id` (int): El ID del contacto que se desea recuperar.

    **Return:**
        - `HttpResponse`: La respuesta que renderiza la plantilla 'contact_detail.html' con los detalles del contacto.

    **Raises:**
        - `Http404`: Si no se encuentra un contacto con el ID proporcionado.
    """
    # Recupera el contacto con el ID proporcionado. Si no existe, lanza una excepción Http404.
    try:
        contact = get_object_or_404(Contact, id=contact_id)
    except:
        messages.error(request, 'Contacto no encontrado ')
        return redirect('find_all')
    # Renderiza la plantilla 'contact_detail.html' con los detalles del contacto.
    return render(request, 'contact_detail.html', {'contact': contact})


def update_by_id(request, contact_id):
    """
    Actualiza los detalles de un contacto existente por su ID.

    **Args:**
        - `request` (HttpRequest): El objeto de solicitud HTTP que contiene los datos del formulario.
        - `contact_id` (int): El ID del contacto que se desea actualizar.

    **Return:**
        - `HttpResponse`: La respuesta que renderiza la plantilla 'update_contact.html' con el formulario del contacto.
        - Si el método es `POST` y el formulario es válido, se guarda el contacto actualizado y se muestra un mensaje de éxito.

    **Raises:**
        - `Contact.DoesNotExist`: Si no se encuentra un contacto con el ID proporcionado.
    """
    # Recupera el contacto con el ID proporcionado. Si no existe, lanza una excepción Contact.DoesNotExist.
    try:
        contact = Contact.objects.get(id=contact_id)
    except:
        # Si ocurre una excepción, muestra un mensaje de error y redirige a la vista 'find_all'.
        messages.error(request, 'Contacto no encontrado ')
        return redirect('find_all')
    if request.method == 'GET':
        # Si la solicitud es GET, muestra el formulario con los datos actuales del contacto.
        form = ContactForm(instance=contact)
        return render(request, 'update_contact.html', {'form': form, 'id': contact_id})
    if request.method == 'POST':
        # Si la solicitud es POST, actualiza el contacto con los datos enviados en el formulario.
        form = ContactForm(request.POST, instance=contact)
        if form.is_valid():
            # Si el formulario es válido, guarda los cambios en la base de datos.
            form.save()
            return render(request, 'contact_detail.html', {'contact': contact})
        else:
            # Si el formulario no es válido, muestra un mensaje de error.
            messages.error(request, 'Error al actualizar el contacto')
    # Renderiza la plantilla 'update_contact.html' con el formulario (y el ID del contacto).
    return render(request, 'update_contact.html', {'form': form, 'id': contact_id})


@ never_cache
def create_one(request):
    """
    Crea un nuevo contacto en la base de datos mediante un formulario.

    **Args:**
        - `request` (HttpRequest): El objeto de solicitud HTTP que contiene los datos del formulario.

    **Return:**
        - `HttpResponse`: Si la solicitud es `GET`, renderiza la plantilla 'create_contact.html' con un formulario vacío para crear un nuevo contacto.
        - Si la solicitud es `POST`, valida el formulario y, si es válido, guarda el nuevo contacto en la base de datos y redirige a la vista 'find_all'.
        - Si el formulario no es válido, renderiza nuevamente la plantilla 'create_contact.html' con el formulario y un mensaje de error.

    **Raises:**
        - Ninguna excepción explícita en esta función. Si el formulario no es válido, se maneja internamente.
    """
    if request.method == 'GET':
        # Si la solicitud es GET, muestra el formulario vacío para crear un nuevo contacto.
        form = ContactForm()
        return render(request, 'create_contact.html', {'form': form})
    if request.method == 'POST':
        # Si la solicitud es POST, crea una instancia del formulario con los datos enviados.
        form = ContactForm(request.POST)
        if form.is_valid():
            # Si el formulario es válido, guarda el nuevo contacto en la base de datos.
            form.save()
            # Redirige a la vista 'find_all' después de guardar el contacto.
            return redirect('find_all')
        else:
            # Si el formulario no es válido, muestra un mensaje de error.
            messages.error(request, 'Error al crear el contacto')
            # Si el formulario no es válido, vuelve a renderizar la página con el formulario y el error.
            return render(request, 'create_contact.html', {'form': form})


@ never_cache
def confirm_delete(request, contact_id):
    """
    Muestra una página de confirmación para la eliminación de un contacto y procesa la eliminación si se confirma.

    **Args:**
        - `request` (HttpRequest): El objeto de solicitud HTTP que contiene los datos de la solicitud.
        - `contact_id` (int): El ID del contacto que se desea eliminar.

    **Return:**
        - `HttpResponse`: Si la solicitud es `POST`, redirige a la vista 'find_all' después de eliminar el contacto.
        - Si la solicitud es `GET`, renderiza la plantilla 'confirm_delete.html' mostrando los detalles del contacto a eliminar.

    **Raises:**
        - `Http404`: Si no se encuentra un contacto con el ID proporcionado.
    """
    # Recupera el contacto con el ID proporcionado. Si no existe, lanza una excepción Http404.
    try:
        contact = get_object_or_404(Contact, id=contact_id)
    except:
        # Si no se encuentra el contacto, muestra un mensaje de error y redirige a la vista 'find_all'.
        messages.error(request, 'Contacto no encontrado')
        return redirect('find_all')
    if request.method == "POST":
        # Si la solicitud es POST, elimina el contacto de la base de datos.
        contact.delete()
        # Redirige a la vista 'find_all' después de eliminar el contacto.
        return redirect('find_all')
    # Si la solicitud es GET, muestra la página de confirmación de eliminación.
    return render(request, 'confirm_delete.html', {'contact': contact})
