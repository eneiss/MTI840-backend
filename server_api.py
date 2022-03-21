from enum import Enum
from flask import Flask, json, request, render_template
from datetime import datetime

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

    global last_too_humid_time
    global app_state

    try:
        print(request.json)
        humidity = int(request.json['humidity'])
        temperature = int(request.json['temperature'])

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


# ------------------------------ METHODS

def switch_state(new_state: int):
    global app_state
    app_state = new_state
    print(f"switching to state {new_state}")

# ------------------------------ MAIN

if __name__ == '__main__':
    # api.run(host="0.0.0.0")     # open to the rest of the network
    api.run()