
from enum import Enum
from flask import Flask, json, request, render_template, Response
from datetime import datetime
import signal
import csv

# ------------------------------ CONSTANTS & ENUMS

class AppState(Enum):
    ITSOK = 0
    TOO_HUMID = 1

class Warnings(str, Enum):
    NONE = "none"
    TOO_HUMID = "too_humid"
    HUMIDITY_OK = "humidity_ok"
    TEMP_TOO_LOW = "temperature_too_low"

TEST_RES = [{"result": "test"}, {"success": True}]

MIN_HUMIDITY = 30
MAX_HUMIDITY = 60
MAX_HUMIDITY_MARGIN = 5     # margin taken from max humidity to send the "humidity ok now" signal
MIN_TEMPERATURE = 5
BUFFERING_TIME = 20     # in seconds

# ------------------------------ CONFIG & VARIABLES

api = Flask(__name__)
api.config['TESTING'] = True
api.config['TEMPLATES_AUTO_RELOAD'] = True

app_state = AppState.ITSOK
last_too_humid_time = 0
humiture_file = open('humiture_data.csv', mode='a+', newline="")
humiture_file_writer = csv.writer(humiture_file, delimiter=';', quotechar='"', quoting=csv.QUOTE_MINIMAL)
humiture_file_reader = csv.reader(humiture_file, delimiter=';')

# ------------------------------ API ROUTES

@api.route('/')
def dashboard():
    return render_template('dashboard.html')
    # return "<p>MTI840 API</p>", 200

@api.route('/test', methods=['GET'])
def get_test():
    return json.dumps(TEST_RES)

@api.route('/humiture', methods=['POST'])
def post_humiture():
    # with open('humiture_data.csv', mode='r', newline="") as csv_file:
    #
    #     csv_reader = csv.reader(csv_file, delimiter=';')
    #
    #     for row in csv_reader:
    #         date = datetime.strptime(row[0], "%d/%m/%Y, %H:%M:%S")
    #         humidity = int(row[1])
    #         temperature = int(row[2])
    #
    #     print("Read line", date, "  :  ", humidity, temperature)

    global last_too_humid_time
    global app_state
    global humiture_file_writer

    try:
        print(request.json)
        humidity = int(request.json['humidity'])
        temperature = int(request.json['temperature'])

        # write humiture data to csv file
        # TODO: open & close only once
        # with open('humiture_data.csv', mode='a', newline="") as humiture_file:
        humiture_file_writer.writerow([datetime.now().strftime("%d/%m/%Y, %H:%M:%S"), humidity, temperature])

        warning = Warnings.NONE

        if app_state == AppState.ITSOK:
            if humidity > MAX_HUMIDITY:
                last_too_humid_time = datetime.now()
                warning = "too_humid"
                switch_state(AppState.TOO_HUMID)

        elif app_state == AppState.TOO_HUMID:
            # if temperature > MIN_TEMPERATURE:       # temperature ok
            if humidity < MAX_HUMIDITY - MAX_HUMIDITY_MARGIN:   # humidity ok
                if (datetime.now() - last_too_humid_time).total_seconds() >= BUFFERING_TIME:      # humidity values have stabilized below the threshold
                    warning = Warnings.HUMIDITY_OK
                    switch_state(AppState.ITSOK)
            else:
                last_too_humid_time = datetime.now()

            # else:
                # warning = Warnings.TEMP_TOO_LOW

        return json.dumps({"success": True, "warning": warning}), 201

    except KeyError:
        return json.dumps({"success": False, "error": "KeyError"}), 400

    except Exception as e: 
        print(e)
        return json.dumps({"success": False}), 400

@api.route('/chart_data', methods=['GET'])
def get_chart_data():

    temperature_array = []
    humidity_array = []
    size = 0

    for row in humiture_file_reader:
        date = datetime.strptime(row[0], "%d/%m/%Y, %H:%M:%S")
        humidity = int(row[1])
        temperature = int(row[2])

        temperature_array.append(temperature)
        humidity_array.append(humidity)
        size += 1

    return Response(json.dumps({
        'size': 7,
        'labels': ["a" for i in range(size)],       # TODO: use timestamps (maybe reformat them)
        "temperature": temperature_array,
        "humidity": humidity_array
    }), mimetype='application/json')

# ------------------------------ METHODS

def switch_state(new_state: int):
    global app_state
    app_state = new_state
    print(f"switching to state {new_state}")

def keyboardInterruptHandler(signal, frame):
    print("Shutting down server...")
    # TODO: close the csv file here
    exit(0)

# ------------------------------ MAIN

if __name__ == '__main__':
    signal.signal(signal.SIGINT, keyboardInterruptHandler)
    # api.run(host="0.0.0.0")     # open to the rest of the network
    api.run()
