import { IPlatform } from "./types/platform.interface";

export class LarpAGIBot {
  private platforms: IPlatform[] = [];

  public registerPlatform(platform: IPlatform) {
    this.platforms.push(platform);
  }

  public async start() {
    console.log("🤖 Initializing LARP-AGI...");

    for (const platform of this.platforms) {
      try {
        await platform.initialize();
        await platform.start();
      } catch (error) {
        console.error(`Failed to start platform:`, error);
      }
    }

    this.handleShutdown();
  }

  private handleShutdown() {
    process.on("SIGINT", async () => {
      console.log("\n🤖 Shutting down LARP-AGI...");

      for (const platform of this.platforms) {
        try {
          await platform.stop();
        } catch (error) {
          console.error(`Failed to stop platform:`, error);
        }
      }

      process.exit();
    });
  }
}
