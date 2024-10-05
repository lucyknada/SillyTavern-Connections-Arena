import { eventSource, event_types, is_send_press, sendSystemMessage, system_message_types } from "../../../../script.js";
import { getContext } from "../../../extensions.js";
import { registerSlashCommand } from "../../../slash-commands.js";
import { textgen_types } from '../../../textgen-settings.js';

function log(...args) {
  console.log('[local-chatbot-arena]', ...args)
}

function getModels() {
  return Array.from(document.querySelector("#connection_profiles")).filter(x => x.text.length > 0).filter(x => x.text.includes("arena"))
}

async function switchModel() {
  const models = getModels().map(x => x.value);
  const model = models.at(Math.floor(Math.random() * models.length))
  document.querySelector("#connection_profiles").value = model;
  document.querySelector("#connection_profiles").dispatchEvent(new Event('change'))
  log("switching to model", model);
  //toastr.info(`Switching to ${model}`)
}

function getLatestMessage() {
  return getContext().chat.filter(x => !x.is_system).at(-1);
}

async function interceptMessage() {
  // do not block main thread-loop
  (async () => {
    log("processing received message");

    if (!event_types?.GENERATION_ENDED) {
      log("GENERATION_ENDED event missing");
      while (is_send_press) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    const message = getLatestMessage();
    if (message?.extra?.api !== textgen_types.TABBY) {
      return;
    }

    switchModel();

    // don't always change the model
    // if(Math.random() < 0.8) {
    //     switchModel()
    // }
  })()
}

function getValue(value) {
  const extras = getLatestMessage().extra
  const storage = JSON.parse(localStorage.getItem("chatbot_arena_storage"))?.[`${extras.model}`]
  return (storage?.[value] ?? null)
}

function storeKeyValue(key, value) {
  const extras = getLatestMessage().extra
  const storage = JSON.parse(localStorage.getItem("chatbot_arena_storage"));
  localStorage.setItem("chatbot_arena_storage", JSON.stringify({
    ...storage, [`${extras.model}`]: {
      ...storage[`${extras.model}`],
      [key]: value
    }
  }))
}

function reportGoodModel() {
  const extras = getLatestMessage().extra
  storeKeyValue("good", (getValue("good") ?? 0) + 1)
  toastr.info(`recorded ${extras.model}`)
}

function reportBadModel() {
  const extras = getLatestMessage().extra
  storeKeyValue("bad", (getValue("bad") ?? 0) + 1)
  toastr.info(`recorded ${extras.model}`)
}

function forceSwitchModel() {
  switchModel()
}

function getStats() {
  const storage = JSON.parse(localStorage.getItem("chatbot_arena_storage") ?? {});
  if (!storage || Object.keys(storage).length === 0) {
    sendSystemMessage(system_message_types.EMPTY, "No chatbot stats yet!");
    return;
  }

  const statsBad = Object.entries(storage).filter(([_, val]) => !!val.bad).sort(([a_key, a], [b_key, b]) => b.bad - a.bad).map(([model, value]) => {
    return `[ ${value.bad} ] ${model}`
  })

  sendSystemMessage(system_message_types.EMPTY, ["<b><u>Bad Ratings</u></b>", ...statsBad].join("<p><p/>"));

  const statsGood = Object.entries(storage).filter(([_, val]) => !!val.good).sort(([a_key, a], [b_key, b]) => b.good - a.good).map(([model, value]) => {
    return `[ ${value.good} ] ${model}`
  })

  sendSystemMessage(system_message_types.EMPTY, ["<b><u>Good Ratings</u></b>", ...statsGood].join("<p><p/>"));
}

function cleanStats() {
  localStorage.setItem("chatbot_arena_storage", "{}")
  toastr.info("Arena stats reset!")
}

function listModels() {
  const models = getModels().map(x => x.text);
  log("123", models)
  sendSystemMessage(system_message_types.EMPTY, ["<b><u>Current arena models</u></b>", ...models].join("<p><p/>"));
}

registerSlashCommand('arenamodels', listModels, []);
registerSlashCommand('arenareset', cleanStats, []);
registerSlashCommand('arenastats', getStats, []);

registerSlashCommand('switchmodel', forceSwitchModel, ['sm']);
registerSlashCommand('goodmodel', reportGoodModel, ['gm']);
registerSlashCommand('badmodel', reportBadModel, ['bm']);

eventSource.on(event_types?.GENERATION_ENDED || event_types.MESSAGE_RECEIVED, interceptMessage);

if (!localStorage.getItem("chatbot_arena_storage")) {
  localStorage.setItem("chatbot_arena_storage", JSON.stringify({}))
}
