<!-- +2 -->
- How many folks?
- P2P Distributed File System, content addressable & immutable
 
<!-- +10..+6 -->
Cyclic evolution

<!-- +1 -->
10 min

<!-- +1 -->
Distributed data store:\
Data stored on more than one node (often replicated)\
Distributed database

<!-- +4..+10 -->
Eric Brewer:

University of California, Berkeley\
Vice president of infrastructure - Google\
USA.gov

- [Consistency](https://en.wikipedia.org/wiki/Consistency_model)
  - Every read receives the most recent write or an error.
  - **Single value for shared data.**
- [Availability](https://en.wikipedia.org/wiki/Availability)
  - Every request receives a (non-error) response, without the guarantee that it contains the most recent write.
  - **100% availability for reads & writes**
- [Partition tolerance](https://en.wikipedia.org/wiki/Network_partitioning)
  - The system continues to operate despite an arbitrary number of messages being dropped (or delayed) by the network between nodes.
  - **Tolerance to network partitions**

“Can” only have 2 of the 3 (may only have 1 or none)

For a “wide area” network:
- usually assumed partitions are inevitable
- Therefore: can only have AP (no C) or CP (no A)

<!-- +7 -->
20 mins

<!-- +2..+10 -->
- Decentralized
  - Not owned nor running in your favorite cloud provider
- Distributed
  - You download and distribute files
- P2P
  - No centralized server required, similar to bittorrent
- Content Addressable
- Immutable
  - Don’t put anything sensitive in IPFS (unless you encrypt it first)
- Distributed Hash Table
  - Not replicated on every node, just the nodes where it makes sense
- Web 3.0
- DAG
  - Chunked file
  - Folder structure (start at the top, root, work your way down)


<!-- +11 -->
30 mins

<!-- +1..+6 -->
- interesting for portable phones where we can’t run a node
- Note: pinning services are technically holding data when your node goes down

<!-- +9 -->
Other talk on OSS and value in enterprises!

<!-- +1..+13 -->
1999 Eric S. Raymond

The easier the code is available for public:
- testing
- scrutiny
- experimentation
The more rapid all bugs will be discovered

Vs

- Lots of time & energy spent hunting for bugs in cathedrals
- source only available to few devs 


the more widely available the source code is for public testing, scrutiny, and experimentation, the more rapidly all forms of bugs will be discovered. In contrast, Raymond claims that an inordinate amount of time and energy must be spent hunting for bugs in the Cathedral model, since the working version of the code is available only to a few developers.

<!-- +8 -->
- Professional services (consulting)
- Walk the walk and talk the talk
- Elastic IPFS
