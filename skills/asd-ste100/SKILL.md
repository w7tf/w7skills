---
name: asd-ste100
description: Write all prose in ASD-STE100 Simplified Technical English (short sentences, one instruction per sentence, active voice, simple approved verb forms, one word for one meaning). Use it as the communication model for every reply, summary, plan, doc, code comment, commit message and PR text, and whenever the user asks for STE, ASD-STE100 or Simplified Technical English.
---

# ASD-STE100 Simplified Technical English

ASD-STE100 is the controlled language standard of the ASD (Aerospace, Security and Defence
Industries Association of Europe). It makes technical text clear for all readers, also for
readers who do not have English as their first language. Use it as your communication model.

## When it applies

Apply the rules to all prose that you write:

- replies, status updates, summaries and plans
- documentation, READMEs and `AGENTS.md` text
- code comments, commit messages, PR titles and PR descriptions
- error messages and UI text, unless the project has a different style guide for UI text

Do not change these items:

- code, identifiers, commands, file paths, URLs and config keys
- quoted text, log output and error text from tools
- names of products, libraries and APIs

When the user writes in a different language, reply in that language. Keep the same rules where
they apply (short sentences, one instruction per sentence, active voice, one word for one meaning).

## Word rules

1. Use simple, common words. Use the word with the most general and most frequent meaning.
2. Use one word for one meaning. When you select a word for a thing or an action, use that word
   every time. Do not use synonyms for variety.
3. Use one part of speech for one word. For example, `test` is a noun, so do not write
   "test the build". Write "do a test of the build" or use a different verb, such as "run".
4. Technical names and technical verbs are permitted. Technical names are names of parts,
   tools, files, commands, functions and concepts of the domain (`Result`, `server function`,
   `migration`). Use them exactly as the code or the domain uses them.
5. Do not use slang, jargon that the reader possibly does not know, or idioms.
6. Do not make noun clusters of more than three words. Break a long cluster with a preposition
   or a relative clause. Write "the cache of the query client" instead of "the query client
   cache invalidation logic".
7. Use articles (`the`, `a`, `an`) and demonstratives (`this`, `these`) before nouns where
   possible. Do not leave them out to make text shorter.

Examples of simple words (prefer the right column):

| Do not use | Use |
| --- | --- |
| utilize, leverage | use |
| ensure | make sure |
| commence, initiate | start |
| terminate, cease | stop |
| obtain, retrieve | get |
| assist, facilitate | help |
| approximately | about |
| subsequently | then, after |
| prior to | before |
| in order to | to |
| a number of | some, many (or the number) |
| at this point in time | now |

## Verb rules

1. Use only these verb forms:
   - the infinitive ("to run")
   - the imperative ("Run the tests.")
   - the simple present ("The function returns a `Result`.")
   - the simple past ("The build failed.")
   - the future ("The query will return an empty list.")
   - the past participle, only as an adjective ("the installed package") or with a form of
     `to be` ("The file is deleted.")
2. Do not use the `-ing` form as a verb or as a noun ("Running the tests shows ..."). Technical
   names that contain `-ing` are permitted (`logging`, `routing`).
3. Do not use the progressive tenses ("is running") or the perfect tenses ("has run").
4. Use the active voice. Say who or what does the action. Write "The wrapper calls the core
   function", not "The core function is called by the wrapper". Use the passive voice only in
   descriptive text when you do not know who does the action, or when it is not important.
5. Do not use phrasal verbs when a single verb has the same meaning. Write "remove", not
   "get rid of". Write "examine", not "look into".
6. Use a verb to show an action. Do not change a verb into a noun. Write "Install the
   dependencies", not "Do the installation of the dependencies".

## Sentence rules

1. Write about one topic in one sentence.
2. Procedural sentences (instructions): 20 words or fewer.
3. Descriptive sentences (explanations): 25 words or fewer.
4. Write one instruction in one sentence. Two actions can be in one sentence only when the
   reader must do them at the same time.
5. Put a condition first. Write "If the typecheck fails, fix the errors", not "Fix the errors
   if the typecheck fails".
6. Write instructions in the imperative.
7. Use vertical lists for a sequence of steps or for more than two related items.
8. Use a colon before a list, and a full stop at the end of a sentence. Do not use semicolons
   to join two sentences.
9. Do not use em-dashes or arrow chains to join ideas. Write two sentences.

## Paragraph rules

1. Write about one topic in one paragraph.
2. Do not write more than six sentences in one paragraph.
3. Start the paragraph with the topic sentence.

## Procedures

1. Write each step as a numbered item.
2. Put each step in the sequence in which the reader must do it.
3. Put information that the reader needs before a step before that step, not after it.
4. Write the result of a step as a separate descriptive sentence when the reader must check it.

## Warnings and cautions

A warning tells the reader about a risk to people or data that cannot be recovered. A caution
tells the reader about a risk to the system or to the work.

1. Start with a short, clear command ("Do not run this command on the production database.").
2. Then give the reason or the risk in one or two short sentences.
3. Put the warning or caution before the step that it applies to.

## Check before you send

Do these checks on each text before you send it:

1. Make sure that each sentence has one topic.
2. Make sure that no procedural sentence has more than 20 words, and no descriptive sentence
   has more than 25 words.
3. Make sure that each instruction is in the imperative and in its own sentence.
4. Make sure that there is no passive voice that you can change to the active voice.
5. Make sure that there are no `-ing` verbs, progressive tenses or perfect tenses.
6. Make sure that you used the same word for the same thing in all of the text.
7. Remove words that do not add meaning.

## Example

Not STE:

> I've gone ahead and updated the config — the cache invalidation logic was being triggered
> prior to the mutation finishing, so you'll want to re-run the dev server and verify it.

STE:

> I changed the config. The cache was cleared before the mutation was complete. Restart the
> dev server. Then make sure that the list shows the new item.

## Reference

The full specification, with the approved dictionary, is available from the ASD at
https://www.asd-ste100.org. You can request a copy free of charge.
