from django import template

register = template.Library()

@register.filter
def format_cpf(value):
    """Formata um CPF para o padrão 000.000.000-00."""
    if value and len(value) == 11:  # Verifica se o CPF tem 11 dígitos
        return f"{value[:3]}.{value[3:6]}.{value[6:9]}-{value[9:]}"
    return value  # Retorna sem formatação se não for válido