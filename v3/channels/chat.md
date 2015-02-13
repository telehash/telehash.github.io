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

A `chat` is a container of one or more `messages` from one or more participants.  A participant is always a single [hashname](../hashname/), the list of participants for a single chat is called a `roster` and the first participant is called the `leader`.  All messages are sent synchronously over a `chat` channel or fetched asynchronously via [THTP](thtp.md).

The simplest form of a `chat` between two `hashnames` is a single channel sending/receiving `messages` bi-directionally on that channel.

All chat and message IDs are 8 bytes generated using [SipHash](http://en.wikipedia.org/wiki/SipHash), then base32 encoded (identically to hashnames) when used in a string.

Every chat uniquely identified by using first half of the leader's hashname (16 bytes) as the key for a SipHash digest of an arbitrary value called the `name`, resulting in a final unique 8 byte mesh-wide unique chat ID. The variable `name` value can be automatically generated on demand or may be derived from or mapped to other application-specific data to create stable IDs for all participants.

## THTP

The roster and individual messages can be fetched asynchronously using [THTP](thtp.md). The roster should only ever be requested from the leader, and individual messages should only be requested from each participant.  The leader must always be able to return the join messages for every participant as well.

* `thtp://2whzi65idcn33wzacvwfy2shsgdgtabr4gadcxtfbwhy2atxok2q/chat/sgoomt3lqqkia/roster`
  * **2whzi65idcn33wzacvwfy2shsgdgtabr4gadcxtfbwhy2atxok2q** the leader of the chat
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
  "seq":1,
  "type":"chat",
  "chat":"sgoomt3lqqkia",
  "join":"4gadcxtfbwhy2",
  "last":"cn33wzacvwfya,42",
  "roster":"ylgsjzjrh4m7b"
}
```

The fields are defined as:

* **type** - always `chat`
* **chat** - (only sent in the request) the id of the chat
* **join** - (optional) the join id of the sender (must match the roster), required for all except non-participants of a `visible` chat
* **last** - (optional) the last chat message id from the sender, this can be used by the recipient to fetch any missed/historical ones from the sender
* **roster** - (optional, only sent when the sender has a roster) the hash of the sender's current roster for this chat, if it doesn't match the stored one then fetch it from the leader or sender and look for new participants

A chat channel can be opened by any hashname to another hashname that is either the leader or an existing participant, but it can only be initially started by the leader to invite a new hashname as a participant to an existing chat (participants can't invite each other directly).

### Permissions / Roster

The leader may set a star entry in the roster of `"*":"invite"` to indicate that anyone can join and retrieve data for this chat.

The star entry of `"*":"block"` indicates that only hashnames listed in the roster may join and retrieve data.

No star entry indicates that it is a read-only `visible` chat, anyone can retrieve data but only the hashnames listed in the roster can join.  If the leader makes changes to the roster on a visible chat it must re-connect to notify anyone connected of the changes.

Any hashname in the roster can either have the values of "invite", "block", or their actual/known join message id, indicating that they are blocked, allowed to join, or already joined.

When new participants are added to the chat the nature of them connecting to everyone will update their rosters, but when the leader changes an existing entry it must re-establish chat channels with the participants to notify them of the roster change.  Participants only need to use their cached roster to determine the permission for any other incoming connection, and if they don't have a roster yet (new chat invite) they should respond as read-only (no `from`) until they decide to join/accept and then re-connect.

### Interface

A chat UI is determined based on the roster and participants.  When there are only two participants (after resolving all the join messages and any `aka` values validated) and the roster is default blocked to new participants joining it can be shown as a 1:1 interface to the user, otherwise it should be shown as a list of participants / chatroom.

When the roster default is not block or invite it should be displayed as a read-only feed.

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

Every message is identified by a unique ID that is generated by and specific to a single participant.  These message IDs are string encoded as a combination of a SipHash digest in base32 followed by a comma and a sequence integer, for example `cn33wzacvwfya,42`.  Every ID from one participant forms a chain based on the sequence number, where simply hashing the 8-byte digest in a higher ID must result in the digest value for the next lower ID.

The first time any participant starts or accepts chat it must begin with a join message at sequence 0.  The chain of digests are created using the first half of the participant's hashname (16 bytes) and starting with an initial random secret value, and then recursively hashing the 8-byte digest outputs a large number of times (more than the potential number of messages to be sent in the chat).  The sequence 0 join message then has that final digest as its ID and sequentially higher sequences must have the correct parent/source hash in the chain.  This ensures that all messages from a participant can be mapped to their join ID, and only they can generate newer messages from that join.

The join ID is then saved in the roster for every participating hashname and all messages from that hashname must use a higher sequence number and correctly chained IDs.

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

The joining participant should try to initiate connections to the other participants via the leader (send a `peer` request directly to the leader for each participant), since they are connected already the leader can act as a temporary router to the other hashnames.

## Chat Messages

Each chat message is a LOB-encoded packet who's JSON object has these common fields:

* **id** - (required) the unique message id as calculated by the sender
* **type** - (required) "chat"
* **chat** - (required) plain text, optionally basic markdown
* **state** - (optional) senders current activity state [active, inactive, gone, composing, paused] based on [XEP-0085](http://xmpp.org/extensions/xep-0085.html)
* **after** - (required) the most recent message id in the chat the sender has seen
* **at** - (optional) epoch (in seconds, UTC)
* **refs** - (optional) object, key:uri pairs, references
* **alts** - (optional) object, key:string of alternate text formats (rtf, xhtml, etc), if the value is a boolean `true` the alternate is attached as the BODY

```json
{
  "type":"chat",
  "id":"k46demhj7b6ii,9",
  "at":1394162554,
  "after":"qgo32j67kbyjj,14",
  "chat":"...markdown \[ref\]\[\]...",
  "refs":{"ref":"uri:foo"}
}
```

The id must be validated with the sender's join. There may be images embedded in the markdown and should be loaded if possible.

Chat messages should only be updated as long as there were no other messages sent yet after it, subsequent identical chat message ids replace previous ones.  This can be displayed visually as either corrections/edited, or as-you-type live chat.

When a message text begins with "/me " the UI should display the message styled as an "action" coming from the sender.

### Join Messages

A join message is required before any chat messages from any participant, it is always the sequence `0` of the message IDs.

* **id** - (required) the sequence `0` id for the participant
* **type** - (required) "join"
* **join** - (required) plain text
* **at** - (optional) epoch (in seconds, UTC)
* **refs** - (optional) object, key:uri pairs, references
* **aka** - (optional) array of other participant hashnames that are the same sender

```json
{
  "id":"cbaccqcqiaqca",
  "type":"join",
  "at":1394162554,
  "join":"Jeff Strongman",
  "refs":{"twitter":"http://twitter.com/strongman","email":"mailto:jeff@strongman.com","pic":"thtp:///profile/thumbnail.png","nick":"strongman"},
  "aka":["e5mwmtsvueumlqgo32j67kbyjjtk46demhj7b6iibnnq36fsylka"]
}
```

The join text is the name for display, with optional profile pic (may be a THTP url) and nickname in the refs.

The aka is other hashnames that must also be in the roster, and when validated by fetching their join message with a reciprocated hashname (or they're in "invited" state), messages from either should be visually displayed as from the same sender.  Joins with identical text/nick/pic (depending on what's displayed) should be modified visually so they are distinct (add a (2), etc).

The BODY may be a signed JWT that must contain the sender's `hashname` in the claims to be independently verified by the app.

## Receipt Messages

The channel can carry ad-hoc receipt messages alongside chats.  These messages have a `"type":"ack"` and are only sent from the recipient back to the sender/owner of a chat message.  They only signal a current state change and are never stored, cached, or re-sent.

```json
{
  "type":"ack",
  "id":"k46demhj7b6ii,9",
  "ack":"received"
}
```

Ack States:

* received - message was received and processed/queued/notified
* read - text was displayed
* seen - any embedded references were displayed (media)
* logged - chat was saved to external storage
* referred - a reference was followed (clicked/opened)
* saved - liked, bookmarked
* copied - clipboard, pic was copied, message was forwarded

Ack messages can be updated anytime, all of the states should replace/update the last received one.

