from django.db import models


class Contact(models.Model):

    name = models.CharField(max_length=25, blank=False, null=False)
    phone = models.CharField(max_length=18, unique=True)
    email = models.EmailField(max_length=355, blank=False, null=False)

    def _str__(self) -> str:
        return self.name if self.name else ''
