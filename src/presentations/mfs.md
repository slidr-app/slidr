<!-- +2 -->
#### Close your eyes and imagine your next project…

What tools and frameworks will you reach for?

When I do it…
- …this time is gonna be different
- …this time is gonna be right
- …this time it’s gonna be rainbows
- …this time it’s gonna be unicorns

Reach for new tech

Start with new technologies\
Get 80% through, then hit a moment when dev vel plumits because we didn’t think about that last 20%

When we close our eyes we think about that 

#### How we imagine our next project.

The fantastic life at conferences learning the latest technologies!

Shiny new technologies

<!-- +1 -->

The real life as a software dev.

Massive gap!

Real world people working really hard.

Focus on the hard 20%!

<!-- +1..+5 -->
Italian economist Vilfredo Pareto

We know the risk of a project comes from complex features. THese become hard to change later in the project. Spending 80% of the time doing 20% of the work.

Don’t optimize to be the best at doing the easy stuff, optimize it to be great at building very complex (real world) features.

Why\
80/20 (steve jobs and amazon)\
Limit the tech debt from the beginning of the project.\
If you don’t know your domain

- The remaining 20% is the hard non-functional requirements:
  - Performance
  - Scalability
  - Security (authentication, authorization)
  - Data validation
  - CI pipelines
  - Local DevEx

- Focus on real production grade problems from start
- Choose technologies that fix provide solutions to the non-functional requirements from day 1

<!-- +1..+2 -->
Steve:
- 15 desktop models to 1
- Portable devices to 1
- Peripherals and printers to 0

<!-- +1..+2 -->
Italian economist Vilfredo Pareto

We know the risk of a project comes from complex features. THese become hard to change later in the project. Spending 80% of the time doing 20% of the work.

Don’t optimize to be the best at doing the easy stuff, optimize it to be great at building very complex (real world) features.

Why\
80/20 (steve jobs and amazon)\
Limit the tech debt from the beginning of the project.\
If you don’t know your domain

- The remaining 20% is the hard non-functional requirements:
  - Performance
  - Scalability
  - Security (authentication, authorization)
  - Data validation
  - CI pipelines
  - Local DevEx

- Focus on real production grade problems from start
- Choose technologies that fix provide solutions to the non-functional requirements from day 1

<!-- +1 -->
How can we be innovative in the full-stack space.
- Speed of delivery
- 80/20 rule (most frameworks optimize for the 80%, but forget about the 20% and make it harder: meeting - non-fucntional requirements: performance, scalability, security (authentication, authorization), data validation
- Real production grade problems.

Start with what does project look like.\
Incredibly complex CI pipelines. Real life, do we really 

Platform that runs locally and in the cloud\
Containerized (deploys anywhere)

Principles!

<!-- +1 -->
7

<!-- +1 -->
Why react is so successful: does 1 thing well. Only view, no model, no api layer, no global state

<!-- +2 -->
Has to run everywhere!

<!-- +2 -->
Open source\
Community supported

100% OSS, not 80% OSS + 20% magic secret sauce in a cloud service

<!-- +2 -->
Abstraction should be transparent, can remove them if need be\
Have access to the deep parts

<!-- +1 -->
Turn your tech stack upside down (bottom up)

We are starting from the bottom (or the backend): to solve the 20% that is hard. Goal 

<!-- +4 -->
DevEx: runs anywhere\
Community

Fits mental model of devs: improve devex decrease TTM\
Most devs understand designing systems based on RDB. Maybe not the best but everyone understands.\
PSQL you can do whatever you want.\
Challenge: works well if you have a connection pool. Need a pool to allow for massive scaling. (800 c / server)

DB that runs on my machine, or anywhere (not cloud based)\
SQL because it’s popular, devex, dev experience\
Psql best RDB + has nosql features (JSON support)


TLS Handshake is expensive?

JSON: started in v9… v15/v16beta

<!-- +4 -->
Easy to test\
Node.js backend framework with highest developer satisfaction rating (state of js 2021)\
State of js 2022 -> 3rd most common backend framework

Very easy to migrate to a modular application.

Expose APIs
- Build an application taht is monolith now, but can be split into multiple services (teams) later. (conways law)
  - Plugins with fastify (team can work on different API functionality
  - Graphql federation
- If APIs match business domain (what graphql provides), don’t need to manage global state in react application

<!-- +1..+2 -->
Pause from stack, answer the big question: why graphQL

<!-- +1 -->
* Bad reputation: slow, no longer the case in 2023
* Caching, federation -> API gateway
* Cluster with shared cache

<!-- +3 -->
Expose APIs
- Build an application that is monolith now, but can be split into multiple services (teams) later. (conways law)
  - Plugins with fastify (team can work on different API functionality)
  - Graphql federation
- If APIs match business domain (what graphql provides), don’t need to manage global state in react application

Caching uses memory by default, but can also use redis for shared cache when scaling big!

<!-- +3 -->
URQL
- Caching (graph-cache): with some setup, it can normalize entities allowing caching by id (not just by query)
- Hooks API (devex)

<!-- +1 -->
16

<!-- +7 -->
Build your graphQL APIs to match your business domain
We don’t need to use redux!

<!-- +3 -->
REACT
- Global state
- Used everywhere
- dev s know it

<!-- +3 -->
SSR
- Faster first meaningful render
- SEO

<!-- +1 -->
Fastify-vite SSR React out of the box: fastify-dx\
Jonas Galvez

<!-- +1 -->
18

<!-- +1 -->
Conclusion\
Recap why this stack is good for implementing complex functionality “All custom code”: business logic customized to need of the application, no magic\
Modular\
REal world of software devs is leaky abstraction. (sealed vs leaky) Its a stack that is transparent (you can see the details underneath that you will need to solve the complex business logic problems).

<!-- +1 -->
FURM? MURF?

Send me your ideas to @codyzus

FUN - Fastify Universal
FRUMP

<!-- +1 -->
Professional services (consulting)

Walk the walk and talk the talk
