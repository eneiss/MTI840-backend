
from enum import Enum
from flask import Flask, json, request, render_template, Response
from datetime import datetime, timedelta
import signal
import csv
import pathlib
import os

# Change current working directory to that of this file
os.chdir(pathlib.Path(__file__).parent.resolve())


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

app = Flask(__name__)
app.config['TESTING'] = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

app_state = AppState.ITSOK
last_too_humid_time = 0
humiture_file = open('humiture_data.csv', mode='a+', newline="")
humiture_file.seek(0)
humiture_file_reader = csv.reader(humiture_file, delimiter=';')
humiture_file.seek(0)
humiture_file_writer = csv.writer(humiture_file, delimiter=';', quotechar='"', quoting=csv.QUOTE_MINIMAL)

# ------------------------------ API ROUTES

@app.route('/')
def dashboard():
    return render_template('dashboard.html')
    # return "<p>MTI840 API</p>", 200

@app.route('/test', methods=['GET'])
def get_test():
    return json.dumps(TEST_RES)

@app.route('/humiture', methods=['POST'])
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

@app.route('/chart_data', methods=['GET'])
def get_chart_data():

    total_period = 24  # how many hours back we want to go
    nb_points = 50

    interval = total_period / nb_points  # in hours
    curDate = datetime.now() - timedelta(hours=total_period)
    data = []
    current_point_sum = [0, 0]
    current_point_count = 0
    # print("Starting at ", curDate.strftime("%d/%m/%Y, %H:%M:%S"))

    line_nb = 0
    humiture_file.seek(0)
    for row in humiture_file_reader:
        line_nb += 1
        date = datetime.strptime(row[0], "%d/%m/%Y, %H:%M:%S")

        if date < curDate:
            continue

        while date > curDate + timedelta(hours=interval):
            curDate += timedelta(hours=interval)
            if current_point_count == 0:
                data.append(
                    [curDate - timedelta(hours=interval),
                     None,
                     None])
            else:
                data.append(
                    [curDate - timedelta(hours=interval),
                     current_point_sum[0] / current_point_count,
                     current_point_sum[1] / current_point_count])
            # print("Chunk", curDate - timedelta(hours=interval), "to", curDate, "  :  ", data[-1])
            current_point_count = 0
            current_point_sum = [0, 0]

        if len(data) == nb_points:
            break

        humidity = int(row[1])
        temperature = int(row[2])

        current_point_sum = [current_point_sum[0] + humidity, current_point_sum[1] + temperature]
        current_point_count += 1

        # print("Read line", date, "  :  ", humidity, temperature)

    last = [None, None, None]
    for i in range(len(data)):
        if data[i][1] is None and last[1] is not None:
            data[i][1] = last[1]
            data[i][2] = last[2]
        last = data[i]

    last = [None, None, None]
    for i in range(len(data) - 1, -1, -1):
        if data[i][1] is None and last[1] is not None:
            data[i][1] = last[1]
            data[i][2] = last[2]
        last = data[i]

    # for line in data :
    #     print(line)

    return Response(json.dumps({
        'size': len(data),
        'labels': [data[i][0] for i in range(len(data))],
        "temperature": [data[i][2] for i in range(len(data))],
        "humidity": [data[i][1] for i in range(len(data))]
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
    app.run()
