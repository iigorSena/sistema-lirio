from django import template

register = template.Library()

@register.filter
def format_phone(value):
    if not value or len(value) not in [10, 11]:  # Verifica se o número tem 10 ou 11 dígitos
        return value  # Retorna o valor original se não for válido

    # Remove caracteres não numéricos
    value = ''.join(filter(str.isdigit, str(value)))

    # Formata com base no comprimento
    if len(value) == 10:  # Telefone fixo
        return f"({value[:2]}) {value[2:6]}-{value[6:]}"
    elif len(value) == 11:  # Telefone celular
        return f"({value[:2]}) {value[2]} {value[3:7]}-{value[7:]}"
    return value

@register.filter
def format_cpf(value):
    """Formata um CPF para o padrão 000.000.000-00."""
    if value and len(value) == 11:  # Verifica se o CPF tem 11 dígitos
        return f"{value[:3]}.{value[3:6]}.{value[6:9]}-{value[9:]}"
    return value  # Retorna sem formatação se não for válido

@register.filter
def format_cep(value):
    if not value:
        return ""
    value = str(value)
    if len(value) == 8:
        return f"{value[:5]}-{value[5:]}"
    return value

