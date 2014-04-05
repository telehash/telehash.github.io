Chat Protocol
=============

This is a next-generation decentralized chat protocol designed to encourage minimal interoperable communication support in future apps and devices.  It is built on [telehash](http://telehash.org) for transport security and has been created based the following principles:

* learn from the experiences with XMPP
* no services or routing
* decoupled from identity
* real-time ephemeral focus, not for archiving/async
* rich media support
* multi-device aware
* for individuals and small groups, not for large/persistent groupchat
* flexible for both private/direct and public/broadcast usage

A `chat` is a container of one or more `messages` from one or more participants.  A participant is always a single `hashname`, the list of participants for a single chat is called a `roster` and the first participant is called the `originator`.  All messages are sent synchronously over a `chat` channel or fetched asynchronously via THTP.

The simplest form of a `chat` between two `hashnames` is a single channel sending/receiving `messages` bi-directionally on that channel. 

Every chat is identified by a unique `endpoint@originator`.  The originator is always the hashname that first created the chat, and the endpoint is up to 32 lower case alphanumeric word characters (ASCII `[a-z0-9_]`) in length.  The endpoint is typically automatically generated on demand to be unique and not visible.

## THTP

The roster and individual messages can be fetched asynchronously using [THTP](bind_http.md). The roster should only ever be requested from the originator, and individual messages should only be requested from each participant.  The originator must always be able to return the join messages for every participant as well.

The following URLs are valid for the chat id `foo@851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6`:

  thtp://851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6/chat/80fdbf31/roster
  
  * `851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6` the originator of the chat
  * `80fdbf31` the 32-bit [murmurhash3](http://en.wikipedia.org/wiki/MurmurHash) of the chat id
  * `roster` request to return the raw JSON of the roster

  thtp://4449fdac8562db31af3c45585a8dded840e9551062a6348489be2fa8d0f8d0b7/chat/80fdbf31/id/431b7ae2,1000
  
  * `4449fdac8562db31af3c45585a8dded840e9551062a6348489be2fa8d0f8d0b7` the hashname of a participant in a chat
  * `80fdbf31` the 32-bit [murmurhash3](http://en.wikipedia.org/wiki/MurmurHash) of the chat id
  * `id` request to return a message sent by this participant
  * `431b7ae2,1000` the id of the message to return as a raw telehash packet

## Chat

The chat channel is reliable and the start request/response looks like:

```json
{
  "c":1,
  "seq":0,
  "type":"chat",
  "to":"foo@851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6",
  "from":"f6a5c420,1000",
  "last":"756ed443,942",
  "roster":"bddff57e"
}
```

The field sare defined as:

* **type** - always `chat`
* **to** - (only sent in the request) the id of the room @ the originator's hashname
* **from** - (optional) the join id of the sender when they want to join, otherwise is a read-only connection
* **last** - (optional) the last chat message id from the sender, this can be used by the recipient to fetch any missed/historical ones from the sender
* **roster** - (optional, only sent when the sender has a roster) the hash of the sender's current roster for this chat, if it doesn't match the stored one then fetch it from the originator or sender and look for new participants

A chat channel can be started by any hashname to a hashname that is the originator or an existing participant, but it can only be started by the originator to invite a new hashname as a participant to an existing chat.

### Permissions / Roster

The originator may set a default entry in the roster of `"*":"invite"` to indicate that anyone can join and retrieve data for this chat.

The default roster entry of `"*":"block"` indicates that only hashnames listed in the roster may join and retrieve data.

No default "*" entry indicates that it is `public` chat and read-only by default, anyone can retrieve data but only the hashnames listed in the roster can join.  If the originator makes changes to the roster on a public chat it must re-connect to notify all of the participants of the changes.

Any hashname in the roster can either have the values of "invite", "block", or their actual/known join message id, indicating that they are blocked, allowed to join, or already joined.

When new participants are added to the chat the nature of them connecting to everyone will update their rosters, but when the originator changes an existing entry it must re-establish chat channels with the participants to notify them of the roster change.  Participants only need to use their cached roster to determine the permission for any other incoming connection, and if they don't have a roster yet (new chat invite) they should respond as read-only (no `from`) until they decide to join/accept and then re-connect.

### Interface

A chat UI is determined based on the roster and participants.  When there are only two participants (after resolving all the join messages and any `aka` values validated) and the roster is default blocked to new participants joining it can be shown as a 1:1 interface to the user, otherwise it should be shown as a list of participants / chatroom.

When the roster default is not block or invite it should be displayed as a read-only feed.

When a message text begins with "/me " the UI should display the message styled as an "action" coming from the sender.

### Sending Messages

A message is a regular telehash packet and can be of any size, so they must be broken into segments and re-assembled if they are larger than the capacity of a single channel packet.

To send a short message that fits in one packet it's just:

```json
{
  "c":1,
  "seq":1,
  "done":true
}
BODY: message packet
```

To break a 1841 byte message into parts it's:

```json
{
  "c":1,
  "seq":1
}
BODY: bytes 0 to 1000

{
  "c":1,
  "seq":2,
  "done":true
}
BODY: bytes 1001 to 1841
```

### Message IDs

Every message is identified by a unique ID that is generated by and unique to a single participant.  These IDs are always a combination of 8 lower-case hex characters (32-bit [murmurhash3](http://en.wikipedia.org/wiki/MurmurHash)) and a sequence integer, for example `756ed443,942`.

The first time any participant starts or accepts chat, it must compute a new sequence resulting in a `join` ID by starting with a random 4 byte secret and recursively hashing that secret some sequence number of iterations.  The sequence chosen is the maximum number of messages that participant will be able to send in this chat over it's entire lifetime.  For example, this is a join ID for up to 1000 messages: `431b7ae2,1000`.

The join ID is then saved in the roster for every hashname and all messages from that hashname must use a lower sequence number than their join with the correct originating hash for that sequence.

## Roster

When fetched via THTP, the roster is a JSON object:

```json
{
  "851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6":"0dee880e,1000",
  "4449fdac8562db31af3c45585a8dded840e9551062a6348489be2fa8d0f8d0b7":"invited",
  "46fe53c258bbc1984fb5ab02ca1494eccdd54e9688dbbc2c882c8713f1cc4cf3":"invited",
  "*":"block"
}
```

The roster hash is calculated by alphabetically concatening all of the hashnames and their values with a "," and hashing it, so the above would become the string "*,block,4449fdac8562db31af3c45585a8dded840e9551062a6348489be2fa8d0f8d0b7,invited,46fe53c258bbc1984fb5ab02ca1494eccdd54e9688dbbc2c882c8713f1cc4cf3,invited,851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6,0dee880e,1000" and hashed to `af4b4779`;

## Messages

Each message is a telehash packet containing a JSON object, these are common fields:

* **id** - (required for join/chat, optional for state) the unique message id as calculated by the sender
* **type** - (required, all types) one of "join", "chat", or "state"
* **text** - (required, all types) plain text, optionally basic markdown
* **after** - (required chat) another message id in the chat
* **at** - (optional, all types) epoch (in seconds, UTC)
* **refs** - (optional, join/chat) object, key:uri pairs, references
* **aka** - (optional, join) array of other participants that are the same person
* **alts** - (optional, join/chat) object, key:string of alternate text formats (rtf, xhtml, etc)

The BODY of the packet is optional and it's usage is application-specific, common usages include attaching a cryptographic signature for external validation of the person's identity.

### join

```json
{
  "id":"0ed737e6,942",
  "type":"join",
  "at":1394162554,
  "text":"Jeff Strongman",
  "refs":{"twitter":"http://twitter.com/strongman","email":"mailto:jeff@strongman.com","pic":"thtp:///profile/thumbnail.png","nick":"strongman"},
  "aka":["46fe53c258bbc1984fb5ab02ca1494eccdd54e9688dbbc2c882c8713f1cc4cf3"]
}
```

The text is the name for display, with optional profile pic (may be a thtp url) and nickname in the refs.

The aka is other hashnames that must be in the roster, and when validated by fetching their join message with a reciprocated hashname (or they're in "invited" state), messages from either should be visually displayed as from the same sender.  Joins with identical text/nick/pic (depending on what's displayed) should be modified visually so they are distinct (add a (2), etc).

### chat

```json
{
  "id":"0ed737e6,942",
  "type":"chat",
  "at":1394162554,
  "after":"41cbb0be,1436",
  "text":"...markdown \[ref\]\[\]...",
  "refs":{"ref":"uri:foo"}
}
```

The id must be validated with the sender's join. There may be images embedded in the markdown and should be loaded if possible.

Chat messages may be updated as long as there were no other messages sent yet after it, subsequent identical chat message ids replace previous ones.  This can be displayed visually as either corrections, or as-you-type live chat.

### state

```json
{
  "id":"0ed737e6,942",
  "type":"state",
  "at":1394162554,
  "text":"received"
}
```

State can indicate for either a sender or recipient depending on if there's an `id` included.  If the recipient doesn't know the id it can either fetch it from the sender or ignore the state message.

When there's no `id` it indicates the sender's activity state (based on [XEP-0085](http://xmpp.org/extensions/xep-0085.html)):

* active
* inactive
* gone
* composing
* paused

Recipient states when there's an `id` that references an existing chat message:

* read - text was displayed
* seen - any embedded references were displayed (media)
* logged - chat was saved to external storage
* referred - a reference was followed (clicked/opened)
* saved - liked, bookmarked
* copied - clipboard, pic was copied, message was forwarded
* referenced - embedded in another chat, if public that chat id should be included in the refs

Just like chat messages, state messages can be updated anytime as long as they're the most recent.  All of the states should replace/update the last received one.

## Wire Example

```
NEW CHAT IN
{ to: 'foo@3342495618af3788b01ed43e05117ca1a5b9dd6338844a37653702b37d071526',
  from: '0ed737e6,1000',
  roster: '5c1c1618',
  type: 'chat' }

FETCH ROSTER
thtp:3342495618af3788b01ed43e05117ca1a5b9dd6338844a37653702b37d071526/chat/foo/roster
{ '3342495618af3788b01ed43e05117ca1a5b9dd6338844a37653702b37d071526': '0ed737e6,1000' }

FETCH FROM JOIN MESSAGE
thtp:3342495618af3788b01ed43e05117ca1a5b9dd6338844a37653702b37d071526/chat/foo/id/0ed737e6,1000
{ text: 'jer',
  type: 'join',
  id: '0ed737e6,1000',
  at: 1395609876 }
  
CHAT OUT ANSWER
{ from: '9c45f1d4,1000',
  roster: '5c1c1618' }

CHAT IN MESSAGE
{ done: true } BODY 0x004a {"text":"hello","type":"chat","id":"41cbb0be,999"}

CHAT OUT MESSAGE
{ done: true } BODY 0x0047 {"text":"sup","type":"chat","id":"8811b1ad,999"}
```
