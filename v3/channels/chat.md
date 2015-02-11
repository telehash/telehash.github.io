Chat Protocol
=============

This is a next-generation decentralized chat protocol designed to encourage minimal interoperable communication support in future apps and devices.  It is built on [telehash](http://telehash.org) for transport security and has been created based the following principles:

* learn from the experiences with XMPP
* no services or routing
* decoupled from identity
* real-time ephemeral focus, not for archiving/async
* rich media support
* multi-device aware
* for individuals and small/private groups, not for large/persistent groupchat
* flexible for both private/direct and public/broadcast usage

A `chat` is a container of one or more `messages` from one or more participants.  A participant is always a single [hashname](../hashname/), the list of participants for a single chat is called a `roster` and the first participant is called the `originator`.  All messages are sent synchronously over a `chat` channel or fetched asynchronously via [THTP](thtp.md).

The simplest form of a `chat` between two `hashnames` is a single channel sending/receiving `messages` bi-directionally on that channel.

All chat and message IDs are 8 bytes generated using [SipHash](http://en.wikipedia.org/wiki/SipHash), then base32 encoded (identically to hashnames) when used in a string.

Every chat ID created by taking the 32 bytes from the hashname and appending the 8 byte SipHash output of some arbitrary or random value, then performing another SipHash of the total 40 bytes to get a final unique 8 byte ID. The variable source value can be automatically generated on demand to be unique, or may be derived from or mapped to other application-specific data to create fixed IDs for all participants.

## THTP

The roster and individual messages can be fetched asynchronously using [THTP](thtp.md). The roster should only ever be requested from the originator, and individual messages should only be requested from each participant.  The originator must always be able to return the join messages for every participant as well.

* `thtp://2whzi65idcn33wzacvwfy2shsgdgtabr4gadcxtfbwhy2atxok2q/chat/sgoomt3lqqkia/roster`
  * **2whzi65idcn33wzacvwfy2shsgdgtabr4gadcxtfbwhy2atxok2q** the originator of the chat
  * **sgoomt3lqqkia** the base32 of the 8-byte chat id
  * **roster** request to return the raw JSON of the roster
* `thtp://kf7it53r5tvsylgsjzjrh4m7bsgb4jjygnr6nx3sgoomt3lqqkia/chat/sgoomt3lqqkia/id/4gadcxtfbwhy2,100`
  * **kf7it53r5tvsylgsjzjrh4m7bsgb4jjygnr6nx3sgoomt3lqqkia** the hashname of a participant in a chat
  * **sgoomt3lqqkia** the base32 of the 8-byte chat id
  * **id** request to return a message sent by this participant
  * **4gadcxtfbwhy2,100** the id of the message to return as a raw telehash packet

## Chat

The chat channel is reliable and the start request/response looks like:

```json
{
  "c":1,
  "seq":0,
  "type":"chat",
  "to":"sgoomt3lqqkia",
  "from":"4gadcxtfbwhy2",
  "last":"cn33wzacvwfya,42",
  "roster":"ylgsjzjrh4m7b"
}
```

The field sare defined as:

* **type** - always `chat`
* **to** - (only sent in the request) the id of the room @ the originator's hashname
* **from** - (optional) the join id of the sender when they want to join, otherwise is a read-only connection
* **last** - (optional) the last chat message id from the sender, this can be used by the recipient to fetch any missed/historical ones from the sender
* **roster** - (optional, only sent when the sender has a roster) the hash of the sender's current roster for this chat, if it doesn't match the stored one then fetch it from the originator or sender and look for new participants

A chat channel can be opened by any hashname to another hashname that is either the originator or an existing participant, but it can only be initially started by the originator to invite a new hashname as a participant to an existing chat (participants can't invite each other directly).

### Permissions / Roster

The originator may set a star entry in the roster of `"*":"invite"` to indicate that anyone can join and retrieve data for this chat.

The star entry of `"*":"block"` indicates that only hashnames listed in the roster may join and retrieve data.

No start entry indicates that it is `visible` chat and read-only by default, anyone can retrieve data but only the hashnames listed in the roster can join.  If the originator makes changes to the roster on a visible chat it must re-connect to notify all of the participants of the changes.

Any hashname in the roster can either have the values of "invite", "block", or their actual/known join message id, indicating that they are blocked, allowed to join, or already joined.

When new participants are added to the chat the nature of them connecting to everyone will update their rosters, but when the originator changes an existing entry it must re-establish chat channels with the participants to notify them of the roster change.  Participants only need to use their cached roster to determine the permission for any other incoming connection, and if they don't have a roster yet (new chat invite) they should respond as read-only (no `from`) until they decide to join/accept and then re-connect.

### Interface

A chat UI is determined based on the roster and participants.  When there are only two participants (after resolving all the join messages and any `aka` values validated) and the roster is default blocked to new participants joining it can be shown as a 1:1 interface to the user, otherwise it should be shown as a list of participants / chatroom.

When the roster default is not block or invite it should be displayed as a read-only feed.

When a message text begins with "/me " the UI should display the message styled as an "action" coming from the sender.

### Sending Messages

A message is a regular [LOB](../lob) encoded packet and can be of any size, so they must be broken into segments and re-assembled if they are larger than the capacity of a single channel packet.

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

Every message is identified by a unique ID that is generated by and unique to a single participant.  These IDs are always a combination of a base32 encoded SipHash output and a sequence integer, for example `cn33wzacvwfya,942`.

The first time any participant starts or accepts chat it must begin with a join message at sequence 0.  The initial SipHash digest is calculated from the participants hashname (32 bytes) and the chat ID (8 bytes).  Subsequent messages have a SipHash digest calculated from the previous ID appended with the SipHash of the previous sequence message bytes (16 bytes total).

The join ID is then saved in the roster for every hashname and all messages from that hashname must use a higher sequence number and correctly chained IDs.

* joinID: `b32encode(siphash(b32decode("2whzi65idcn33wzacvwfy2shsgdgtabr4gadcxtfbwhy2atxok2q") + b32decode("sgoomt3lqqkia")))`
* first message: `b32encode(siphash(b32decode(joinID) + siphash(joinMessage)))`


## Roster

When fetched via THTP, the roster is a JSON object:

```json
{
  "frnfke2szyna2vwkge6eubxtnkj46rtctqk7g7ewbvfiesycbjdq":"cbaccqcqiaqca",
  "e5mwmtsvueumlqgo32j67kbyjjtk46demhj7b6iibnnq36fsylka":"invited",
  "w4qnrd3e4tnl2vsc337qzuo3fgwmbhaked5kb3myhgbgvrev6zfa":"invited",
  "*":"block"
}
```

The roster hash is calculated by converting each key/value to binary and sorting the keys in ascending order.  The keys and values then have their SipHash digests calculated and are sequentially rolled up to a final digest.

Use the following to transform the fixed string values to binary when necessary:

* `*` = `0x00`
* `invited` = `0x01`
* `block` = `0x00`

The joining participant should try to initiate connections to the other participants via the originator (send a `peer` request directly to the originator for each participant), since they are connected already it should be faster than looking them up and connecting via a router.

## Messages

Each message is a LOB-encoded packet containing a JSON object with these common fields:

* **id** - (required for chat) the unique message id as calculated by the sender
* **type** - (required) one of "chat", "state", or "ack"
* **text** - (required, all types) plain text, optionally basic markdown
* **after** - (required chat/ack) another message id in the chat
* **at** - (optional, all types) epoch (in seconds, UTC)
* **refs** - (optional, join/chat) object, key:uri pairs, references
* **aka** - (optional, join) array of other participant hashnames that are the same sender
* **alts** - (optional, join/chat) object, key:string of alternate text formats (rtf, xhtml, etc)

The BODY of the packet is optional and it's usage is application-specific, common usages include attaching a cryptographic signature for external validation of the senders's identity.

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

* received - message was received and processed/queued/notified
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
