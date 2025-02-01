from django.urls import path
from . import views
urlpatterns = [
    path('create', views.create_one, name='create_one'),
    path('update/<int:contact_id>',
         views.update_by_id, name='update_by_id'),
    path('datail/<int:contact_id>', views.find_by_id, name='find_by_id'),
    path('', views.find_all, name='find_all'),
    path('delete/<int:contact_id>',
         views.confirm_delete, name='confirm_delete')

]
