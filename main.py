import serial
import csv
import time

# Variables
curr_temp = 0 # sensor temp @ min 0
outside_temp = 8 #  Outdoor air temperature at minute 0 --> later use wether api
predicted_temp = 0 # model's prediction for minute 1
actual_temp = 0 # actual sensor temperature measured at minute 1

k = 0.02
dt = 1
error = 0

# Serial Port
ser = serial.Serial('/dev/cu.usbserial-0001', 115200)
ser.readline() # skip first line

# Get the temp from ESP32 --> input to my_weatherTwin function
line = ser.readline().decode('utf-8').strip()
temp, humidity = line.split(",")

# collect current temp
curr_temp = float(temp)

# read what is feteched --> read until end
# write to csv

def write_error_log(timestamp, predicted, actual, error):
    with open("prediction_error_log.csv", "a", newline="") as csvfile:
        writer = csv.writer(csvfile)
        
        writer.writerow([timestamp, predicted, actual, error])
        csvfile.flush()


# A basic digital twin prediction
def predict_weather(curr_temp):
    # 1. predict predicted_temp after 1 min
    # is a simplified thermal simulation. It models how the temperature near the window might change over time.
    predicted_temp = curr_temp + k * (outside_temp - curr_temp) * dt

    return predicted_temp

def calculate_error(actual_temp, predicted_temp):
    # 2. Calculate error = curr - predicted
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    error = actual_temp - predicted_temp
    write_error_log(timestamp, predicted_temp, actual_temp, error)


while True:
    # Predicy temp
    predicted_temp = predict_weather(curr_temp)

    # wait 1 minute
    time.sleep(60)

    # clear all old data in the 60 sec
    ser.reset_input_buffer()

    # Read data again
    line = ser.readline().decode('utf-8').strip()
    temp, humidity = line.split(",")

    # collect the acutal temp after 1 min
    actual_temp = float(temp)

    # compare and calculate error
    calculate_error(actual_temp, predicted_temp)

    # the current value
    curr_temp = actual_temp

