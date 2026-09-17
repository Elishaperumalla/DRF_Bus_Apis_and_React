from django.contrib import admin
from .models import Bus, Seat
from .models import Booking
from .models import Payment


# Register your models here.
class BusAdmin(admin.ModelAdmin):
    list_display = ('bus_name', 'nunber', 'origin', 'destination', 'start_time', 'reach_time', 'prices')
    search_fields = ('bus_name', 'nunber', 'origin', 'destination')

class SeatAdmin(admin.ModelAdmin):
    list_display = ('seat_number', 'bus','is_booked')
    search_fields = ('seat_number', 'bus__bus_name')    
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'bus', 'seat', 'booking_date')
    search_fields = ('user__username', 'bus__bus_name', 'seat__seat_number')

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'booking', 'amount', 'order_id', 'payment_id', 'status', 'method', 'created_at', 'updated_at')
    search_fields = ('user__username', 'order_id', 'payment_id', 'status')

admin.site.register(Bus, BusAdmin)
admin.site.register(Seat, SeatAdmin)
admin.site.register(Booking, BookingAdmin)
admin.site.register(Payment, PaymentAdmin)

