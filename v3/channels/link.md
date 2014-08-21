### `"type":"link"` - Mesh Connection Maintenance

Link channels are mutual between any two endpoints and only the newest (highest ID) is maintained.  The link open request in either direction may contain another packet as it's BODY that the application uses to additionally qualify or authorize the sender.


```json
{
  "c":1,
  "type":"link"
}
```

Initial response, accepting the link:

```json
{
  "c":1
}
```

In the initial response or at any point an `end` or `err` can be sent to cancel the link.

A link request from the app will continue to attempt to open the channel with a backoff schedule, and then re-checked on any network change or router availability.
