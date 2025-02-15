from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Contact
from .forms import ContactForm
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import Http404
from django.db.models import Q, Value
from django.db.models.functions import Replace
import re
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt


# Utiles
from .utils import custom_validate_email, validate_phone


# @never_cache
# def find_all(request):

#     search_query = request.GET.get('search', '')

#     if search_query.strip() and len(search_query) <= 30:

#         text_part = ''.join(re.findall(r'[a-zA-Z]+', search_query))

#         number_part = ''.join(re.findall(r'[+\d]+', search_query)).lstrip()

#         query = Q()

#         try:
#             contacts = Contact.objects.annotate(
#                 phone_cleaned=Replace(
#                     # Eliminar espacios
#                     Replace('phone', Value(' '), Value('')),
#                     Value('-'), Value('')
#                 ),

#                 name_cleaned=Replace('name', Value(' '), Value(''))
#             )
#         except:
#             messages.error(request, 'No se encontraron contactos')
#             return redirect('find_all')

#         if text_part and text_part.strip():
#             query &= Q(name_cleaned__icontains=text_part)


#         if number_part:
#             query &= Q(phone_cleaned__icontains=number_part)
#         if not query:
#             try:

#                 contacts = Contact.objects.all().order_by('name')
#             except:
#                 messages.error(request, 'No se encontraron contactos')
#                 return redirect('find_all')
#         else:
#             try:

#                 contacts = contacts.filter(query).order_by('name')
#             except:
#                 messages.error(request, 'No se encontraron contactos')
#                 return redirect('find_all')

#     else:
#         try:
#             contacts = Contact.objects.all().order_by('name')
#             search_query = ""
#         except:
#             messages.error(request, 'No se encontraron contactos')
#             return redirect('find_all')

#     page = request.GET.get('page', 1)
#     try:

#         paginator = Paginator(contacts, 6)

#         contacts = paginator.page(page)
#     except:
#         messages.error(request, 'Pagina no encontrada')
#         return redirect('find_all')
#     return render(request, 'list_contacts.html', {'contacts': contacts, 'search_query': search_query})


@never_cache
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
        return redirect('template_list_contact')
    # Renderiza la plantilla 'contact_detail.html' con los detalles del contacto.
    return render(request, 'contact_detail.html', {'contact': contact})

# ======Cambiar por AJAX==========
# def update_by_id(request, contact_id):

#     try:
#         contact = Contact.objects.get(id=contact_id)
#     except:

#         messages.error(request, 'Contacto no encontrado ')
#         return redirect('find_all')
#     if request.method == 'GET':

#         form = ContactForm(instance=contact)
#         return render(request, 'update_contact.html', {'form': form, 'id': contact_id})
#     if request.method == 'POST':

#         form = ContactForm(request.POST, instance=contact)
#         if form.is_valid():

#             form.save()
#             return render(request, 'contact_detail.html', {'contact': contact})
#         else:

#             messages.error(request, 'Error al actualizar el contacto')

#     return render(request, 'update_contact.html', {'form': form, 'id': contact_id})
# ======Cambiar por AJAX==========


@never_cache
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
        return redirect('template_list_contact')
    if request.method == "POST":
        # Si la solicitud es POST, elimina el contacto de la base de datos.
        contact.delete()
        # Redirige a la vista 'find_all' después de eliminar el contacto.
        return redirect('template_list_contact')

# ======== FUNCIONALIDAD NUEVA CON JSON ======


def find_all_contact(request):
    # Obtener el número de página desde la solicitud
    page_number = request.GET.get('page', 1)
    search_query = request.GET.get('search', '')
    contacts_per_page = 6  # Número de contactos por página
    try:
        # Filtrar contactos si hay un término de búsqueda
        if search_query.strip() and len(search_query) <= 30:

            text_part = ''.join(re.findall(
                r'[a-zA-Z\s]+', search_query)).rstrip()

            number_part = ''.join(re.findall(r'[+\d]+', search_query)).lstrip()
            print(text_part)
            print(number_part)
            filters = Q()
            if text_part:
                filters &= Q(name__icontains=text_part)

            if number_part:
                filters &= Q(phone__icontains=number_part)
            contacts = Contact.objects.filter(filters)

        else:
            contacts = Contact.objects.all().order_by('name')

        paginator = Paginator(contacts, contacts_per_page)
        page_obj = paginator.get_page(page_number)
        # Serializar los contactos de la página actual
        contacts_list = list(page_obj.object_list.values())
        return JsonResponse({
            "contacts": contacts_list,
            "has_next": page_obj.has_next(),  # Indica si hay una página siguiente
            "has_previous": page_obj.has_previous(),  # Indica si hay una página anterior
            "current_page": page_obj.number,  # Número de la página actual
            "total_pages": paginator.num_pages,  # Número total de páginas
        }, status=200)
    except Exception as e:
        print(f"Error: {e}")
        return JsonResponse({"error": "Ocurrió un error al obtener los contactos"}, status=500)


def template_list_contact(request):
    return render(request, 'contacts_list.html')


def validar_contact(name, phone, email):
    errors = {}
    if not name:
        errors['name'] = 'El nombre es obligatorio.'
    if len(name) > 25:
        errors['name'] = 'El nombre debe tener al menos 25 caracteres.'
    try:
        custom_validate_email(email)
    except ValueError as e:
        errors['email'] = str(e)
    try:
        validate_phone(phone)
    except ValueError as e:
        errors['phone'] = str(e)
    return errors


@csrf_exempt
def create_contact(request):
    if (request.method == 'POST'):
        name = request.POST.get('name', '')
        phone = request.POST.get('full_phone_number', '')
        email = request.POST.get('email', '')
        print(phone)
        errors = validar_contact(name, phone, email)
        # Si hay errores, retornarlos en la respuesta
        if errors:
            return JsonResponse({"error": errors}, status=400)
        try:
            Contact.objects.create(name=name, phone=phone, email=email)
            return JsonResponse({"message": "!Contactos Creado Exitosamente"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Método no permitido"}, status=400)


@csrf_exempt
def update_contact(request, contact_id):
    try:
        contact = Contact.objects.get(id=contact_id)
    except Contact.DoesNotExist:
        return JsonResponse({"error": "Contacto no encontrado"}, status=404)
    except Exception as e:
        return JsonResponse({"error": "Error al obtener el contacto:"}, status=400)

    if request.method == 'POST':
        print(request.POST)
        name = request.POST.get('name', '')
        phone = request.POST.get('full_phone_number', '')
        print("Telefono: " + phone)
        email = request.POST.get('email', '')
        errors = validar_contact(name, phone, email)
        # Si hay errores, retornarlos en la respuesta
        if errors:
            return JsonResponse({"error": errors}, status=400)
        contact.name = name
        contact.phone = phone
        contact.email = email
        try:
            contact.save()
            return JsonResponse({
                "message": "Contacto actualizado exitosamente",
                "contact": {
                    "name": contact.name,
                    "phone": contact.phone,
                    "email": contact.email
                }
            }, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Método no permitido"}, status=400)
