Packet Analysis Defense Techniques
==================================

What are some simple techniques that telehash switches can use to protect from external packet analysis revealing anything about the types of content/communications between them?

The best ideas here need to be added and always used, not optional.

The bridge extension can be used to obscure the destination, multiples of them (layered) and can be changed on the fly, but it requires participation/support and isn't optimal to have always-on, is better as a chosen or special-case solution.

## Size Based

Problems: 

- DHT-driven packets will be common and of similiar sizes
- App-baesd content streams could be uniform
- Bulk transfers will be easily identifiable (max size packets)

Ideas: 

- Switches can add random-size extra headers
- Move all small packets up to a minimum size, blocks of 100
- Randomly send/upgrade max-size packets, possibly bursts of dummy ones

## Timing Based

Problems:

- Connection flows (peer/connect) are sequential (peer in, connect out) and could be associated
- A Seek is a burst of new desination ip endpoints
- Person-driven behaviors (messaging, voip) are pretty distinct

Ideas:

- Do random connects, seeks
- Send to multiple additional fake destinations
- Replay app channels to different hashnames randomly