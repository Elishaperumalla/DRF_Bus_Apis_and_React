
from . import views
from django.urls import path
from .views import  create_payment_order,BookingDeletelView,RegisterView, LoginView, BusListCreateView, BusDetailView, BookingView,UserBookingsView

urlpatterns = [
    path('buses/', BusListCreateView.as_view(), name='buses'),
    path('buses/<int:pk>/', BusDetailView.as_view(), name='bus_detail'),
    path('seats/<int:bus_id>/', views.get_seats_by_bus),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/<int:user_id>/bookings/', UserBookingsView.as_view(), name='user_bookings'),
    path('booking/', BookingView.as_view(), name='booking'),
    path('booking_Cancel/<int:booking_id>/', BookingDeletelView.as_view()), 
    path('create-payment-order/', views.create_payment_order, name='create_payment_order'),
    path('Logout/', views.Logout.as_view(), name='Logout'),
    path('change-username/', views.ChangeUsernameView.as_view(), name='change_username'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),

]
