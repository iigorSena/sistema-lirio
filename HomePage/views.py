from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm



def home(request):
    return render(request, "HomePage/home.html")

##Tela de Login
def login_view(resquest):
    if resquest.method == "POST":
        username = resquest.POST['username']
        password = resquest.POST['password']
        user = authenticate(resquest, username=username, password=password)
        if user is not None:
            login(resquest, user)
            return redirect('home')
        else:
            login_form = AuthenticationForm()
    else:
        login_form = AuthenticationForm()
    
    return render(resquest, 'HomePage/login.html', {'login_form':login_form})

def logout_view(resquest):
    logout(resquest)
    return redirect (login)