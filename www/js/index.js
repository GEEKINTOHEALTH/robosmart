var lightbulb = {
	service: 'FF10',
	lightSwitch: 'FF11',
	dimmerLevel: 'FF12',
	powerConsumed: 'FF16'
};

var SERVICE_UUID = 'FF10';
var SWITCH_UUID = 'FF11';

var app = {
	initialize: function() {
		this.bindEvents();
	},
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	onDeviceReady: function() {
		onButton.addEventListener('touchstart', app.on, false);
		offButton.addEventListener('touchstart', app.off, false);
		app.scan();
	},
	scan: function() {
		app.setStatus("Scanning for Bluetooth Lightbulbs...");
		ble.scan([lightbulb.service], 5, app.onDeviceDiscovered);
	},
	onDeviceDiscovered: function(device) {
		// demo code, assume 1 device and connect to it
		console.log(JSON.stringify(device, null, 4));
		app.setStatus("Connecting to " + device.id);
		ble.connect(device.id, app.onConnect, app.onDisconnect);
	},
	onConnect: function(peripheral) {
		console.log(JSON.stringify(peripheral, null, 4));
		app.connectedPeripheral = peripheral;
		app.setStatus("Connected to " + peripheral.id);
		app.syncUI();
	},
	onDisconnect: function() {
		app.setStatus("Disconnected.");
	},
	syncUI: function() {
		var id = app.connectedPeripheral.id;
		//ble.read(id, lightbulb.service, lightbulb.lightSwitch, function(buffer) {
		ble.read(id, SERVICE_UUID, SWITCH_UUID, function(buffer) {
			var data = new Uint8Array(buffer);
			if (data[0] === 1) {
				onButton.className = 'selected';
			} else {
				offButton.className = 'selected';
			}
		});
	},
	on: function() {
		var id = app.connectedPeripheral.id;
		var data = new Uint8Array(1);
		data[0] = 1;
		var success = function() {
				onButton.className = "selected";
				offButton.className = "";
			};
		//ble.write(id, lightbulb.service, lightbulb.lightSwitch, data.buffer, success);			
		ble.write(id, SERVICE_UUID, SWITCH_UUID, data.buffer, success);
	},
	off: function() {
		var id = app.connectedPeripheral.id;
		var data = new Uint8Array(1);
		data[0] = 0;
		var success = function() {
				onButton.className = "";
				offButton.className = "selected";
			};
		//ble.write(id, lightbulb.service, lightbulb.lightSwitch, data.buffer, success);
		ble.write(id, SERVICE_UUID, SWITCH_UUID, data.buffer, success);		
	},
	setStatus: function(status) {
		if (app.timeoutId) {
			clearTimeout(app.timeoutId);
		}
		messageDiv.innerText = status;
		app.timeoutId = setTimeout(function() {
			messageDiv.innerText = "";
		}, 4000);
	}
};

app.initialize();
