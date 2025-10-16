from urllib import request
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.contrib.auth import authenticate, login, logout
from django.views.generic import TemplateView
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.mixins import LoginRequiredMixin


class Home(LoginRequiredMixin, TemplateView):
    login_url = reverse_lazy('login')
    template_name = "Sistema/home.html"

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    error_message = None

    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Checa se o usuário tem pelo menos 1 grupo ou permissão
            if user.groups.exists() or user.user_permissions.exists():
                login(request, user)
                return redirect('home')
            else:
                error_message = "Você não possui permissões para acessar o sistema."
        else:
            error_message = "Usuário ou senha incorretos!"

    login_form = AuthenticationForm()
    return render(request, 'Sistema/login.html', {'login_form': login_form, 'error_message': error_message })

def logout_view(resquest):
    logout(resquest)
    return redirect ('login')
