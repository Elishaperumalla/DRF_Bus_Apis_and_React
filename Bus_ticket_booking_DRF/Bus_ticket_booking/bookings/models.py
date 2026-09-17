from django.contrib.auth.models import User
from django.db import models
from django.conf import settings

# Create your models here.
class Bus(models.Model):
    bus_name= models.CharField(max_length=100)
    nunber= models.CharField(max_length=20,unique=True)
    origin= models.CharField(max_length=50)
    destination= models.CharField(max_length=50)
    feature= models.TextField()
    start_time= models.TimeField()
    reach_time= models.TimeField()
    no_of_seats= models.PositiveBigIntegerField()
    prices= models.DecimalField(max_digits=10, decimal_places=2)


    def __str__(self):
        return f"{self.bus_name} ({self.nunber}) from {self.origin} to {self.destination} feature: {self.feature}  start_time: {self.start_time} reach_time: {self.reach_time} no_of_seats: {self.no_of_seats} prices: {self.prices}"

class Seat(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE , related_name='seats')
    seat_number = models.CharField(max_length=10)
    is_booked = models.BooleanField(default=False)
     
    def __str__(self):
        return f"Seat {self.seat_number} on {self.bus.bus_name} ({self.bus.nunber})"
    
class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    booking_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking by {self.user.username} for {self.bus.bus_name} - Seat {self.seat.seat_number} on {self.booking_date}--{self.bus.start_time}--{self.bus.reach_time}"
    
class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    booking = models.OneToOneField('Booking', on_delete=models.CASCADE, related_name='payment', null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_id = models.CharField(max_length=100, unique=True)
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, default='created')  # e.g. created, paid, failed
    method = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.order_id} - {self.status}" 