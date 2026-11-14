# DualSense WebHID telemetry and motion

In desktop Chrome or Edge on HTTPS or localhost, click **Connect DualSense
WebHID** and select a DualSense or DualSense Edge. The telemetry panel reads
battery level, charge state, and the incoming HID report rate. Gyroscope and
accelerometer data rotate the 3D model to follow the physical controller.
Xbox controllers continue to use the Gamepad API.

## Connection and browser support

- Permission is requested only by the connect button. A previously permitted
  DualSense can reconnect without another prompt.
- **Disconnect WebHID** closes the HID connection and disables automatic HID
  reconnection for this page session, until you explicitly connect again.
  Standard Gamepad input can still work.
- USB and full Bluetooth HID reports are supported. Some Bluetooth setups
  expose only a short report; in that case HID motion and battery data are
  unavailable, and standard Gamepad input remains available where supported.
- Firefox, Safari, and browsers without WebHID can still use the standard
  Gamepad tester. WebHID also requires a secure context.
- Behavior depends on the browser, operating system, firmware, and other
  software using the controller. If opening fails, close other controller
  utilities and retry.

## Motion and telemetry

Motion follows the active DualSense, including when previewing the Xbox model.
If Xbox or another controller is the active Gamepad input, DualSense motion
is paused. Disconnecting clears HID input and resets the model's motion pose.

Motion uses nominal sensor scales and gravity correction, not per-device
factory calibration. Heading is relative, not compass-based, and can drift.
Use **Reset heading** to recenter heading while preserving the current tilt.
Drag the model to orbit the camera independently.

The **Gamepad sample** rate is the app's 50 ms polling loop (about 20 Hz), not
the controller's hardware report rate. **HID reports** measures incoming
supported HID reports independently; UI updates are throttled. Battery
percentages are estimates from the controller's coarse charge indicator.

## Validation

`npm test` runs report-parser, motion-orientation, input-selection, and mocked
HID lifecycle tests under Node.js 24. `npm run check` runs lint, type checks,
tests, and the production build; GitHub Actions runs the same checks.

For hardware testing, use a DualSense or DualSense Edge in desktop Chrome or
Edge, over both USB and Bluetooth where available. Verify:

- Initial permission, cancellation, reload with permission, and explicit retry.
- Battery and charging changes, incoming report rate, and short-report fallback.
- Every face/menu/system button, D-pad diagonals, stick movement/clicks, and
  partial/full trigger pulls, including simultaneous input.
- Pitch, roll, relative heading, heading reset, and cross-model preview.
- Physical disconnect/reconnect, manual HID disconnect, and switching to Xbox
  without DualSense motion affecting the active controller's model.
- Calibration controls and saved settings after reload.

Automated tests use synthetic reports and fake HID devices; they do not prove
hardware behavior, sensor-axis alignment, or compatibility with every firmware.
