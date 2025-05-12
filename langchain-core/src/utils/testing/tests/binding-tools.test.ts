import { z } from "zod";
import { tool } from "../../../tools/index.js";
import { FakeChatModel } from "../index.js";
import { BaseChatModelCallOptions, BindToolsInput } from "../../../language_models/chat_models.js";


/*
  * bindTools were added to the Runnable abstract class as an optional method, so that chaining for withConfig is possible
  * We could also override withConfig to return Model, but that would require more effort to implement
  * We could also implement different Runnable class, but based on my observation, that would also require more effort to implement
  * Also maybe modification of models could return new instance of the model, rather than Runnable?
  * 
*/

class FakeChatModelWithBindTools extends FakeChatModel {
    bindTools( 
      tools: BindToolsInput[],
      kwargs?: Partial<BaseChatModelCallOptions>
    ) {
      return this.bind({
        tools,
        ...kwargs,
      } as Partial<BaseChatModelCallOptions>);
    } 
  }
describe("binding tools", () => {
  it("should bind tools to a function", async () => {
    const model = new FakeChatModelWithBindTools({});

    const echoTool = tool((input) => String(input), {
      name: "echo",
      description: "Echos the input",
      schema: z.string(),
    });
    
    const config = {
      stop: ["stop"],
    };
    
    const tools = [echoTool];
        
    const configuredBoundModel = model.withConfig(config).bind({
      tools,
    } as Partial<BaseChatModelCallOptions>);
    const boundConfiguredModel = model.bindTools(tools).withConfig(config);
  
    const configuredBoundModelResult = await configuredBoundModel
      .invoke("Any arbitrary input");
    const boundConfiguredModelResult = await boundConfiguredModel
      .invoke("Any arbitrary input");
    
    expect(configuredBoundModelResult.content).toEqual(boundConfiguredModelResult.content);

  });
});