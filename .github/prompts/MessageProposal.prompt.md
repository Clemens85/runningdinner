---
name: "Message Proposal"
agent: "agent" # ask | agent | plan | <custom agent name>
model: "Claude Sonnet 4.6 (copilot)" # optional: pin a model
---

For each event an own services stores some message proposals per each type on AWS S3.
The path to access look like generated/message/**TYPE**/**ADMINID\_**.md.
The types are derived from MessageType enum (PARTICIPANT, DINNER_ROUTE, ...).
ProposalExampleGenerator provides already some code and S3 path mapping logic for storing examples for those proposals.
From there you can see how the actual generated proposals can be accessed (S3 paths).

Your task is now to add new code for a new rest endpoint located in MessageServiceRest which uses the code in proposal package (respectively creates new code there) for providing proposals for the message type (like e.g. DINNER_ROUTE).
The code shall try to read out a S3 file (they might not exist), if so, we need to parse this file (MD) and return a new
proposal object to the client which contains structured data for subject and content.
The client code for accesing this endpoint will be implemented later, but now now.
The S3 structure looks like this:

---

## SUBJECT

The subject to parse out

## MESSAGE TEMPLATE

The content to parse out

---

There might be also other sections in the MD file below those two sections.
You shall also parse them out and put them into a generic map of section name to content, which can be used for future extensions of the proposal object.

The endpoint should be able to handle requests for different message types, and return the corresponding proposal if it exists. If the file does not exist, it should return an appropriate response indicating that no proposal is available for the requested message type. This applies also if there occur some issues / errors during the parsing of the file.
