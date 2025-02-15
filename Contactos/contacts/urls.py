from django.urls import path
from . import views
urlpatterns = [
    path('datail/<int:contact_id>', views.find_by_id, name='find_by_id'),
    path('delete/<int:contact_id>',
         views.confirm_delete, name='confirm_delete'),
    # url con AJAX
    path('', views.template_list_contact, name='template_list_contact'),
    path('api/contacts', views.find_all_contact, name='find_all_contact'),
    path('api/contact/create', views.create_contact, name='create_contact'),
    path('api/contact/update/<int:contact_id>',
         views.update_contact, name='update_contact'),


]
