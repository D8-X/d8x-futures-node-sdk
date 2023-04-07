
def count_decimals(number, precision):
    max_value = number + precision / 2  # add half of precision to account for rounding errors
    decimal_part = abs(max_value - int(max_value))
    decimal_places = 0
    while decimal_part > 0 and decimal_places < precision:
        decimal_part *= 10
        decimal_places += 1
        decimal_part -= int(decimal_part)
    return decimal_places

def count_decimals_str(number, precision):
    max_value = number + precision / 2
    decimal_places = 0
    if max_value != int(max_value):
        decimal_places = len(str(max_value).split('.')[1])
    return decimal_places

v1 = count_decimals(52.1999999999999, 4)
v2 = count_decimals_str(52.1999999999999, 4)
print(v1)
print(v2)