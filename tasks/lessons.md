# Lessons

- Always enforce 1000ms `.setTimeout()` and handle `on('timeout')` by calling `.destroy()` when working with `net.Socket()` explicitly to avoid dangling connections when testing closed ports.
- Ensure strict JSON parsing errors are caught on the raw Node HTTP server because we lack Express.js's built-in `body-parser` logic.
