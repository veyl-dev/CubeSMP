package dev.cubesmp.bridge;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitTask;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicBoolean;

public final class CubeSMPBridge extends JavaPlugin {
    private HttpClient client;
    private BukkitTask pollTask;
    private final AtomicBoolean polling = new AtomicBoolean(false);
    private String baseUrl;
    private String apiKey;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        if (!loadSettings()) {
            getLogger().severe("Bridge disabled: configure website.url and website.api-key.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }
        client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        startPolling();
        getLogger().info("CubeSMP Bridge enabled.");
    }

    private boolean loadSettings() {
        baseUrl = getConfig().getString("website.url", "").replaceAll("/+$", "");
        apiKey = getConfig().getString("website.api-key", "");
        return baseUrl.startsWith("https://") && apiKey.length() >= 32 && !apiKey.equals("CHANGE_ME");
    }

    private void startPolling() {
        if (pollTask != null) pollTask.cancel();
        long interval = Math.max(1, getConfig().getLong("delivery.check-interval", 5));
        pollTask = Bukkit.getScheduler().runTaskTimerAsynchronously(this, this::poll, 20L, interval * 20L);
    }

    private void poll() {
        if (!polling.compareAndSet(false, true)) return;
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/api/bridge/jobs/claim"))
                    .timeout(Duration.ofSeconds(getConfig().getLong("delivery.request-timeout-seconds", 10)))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString("{}")).build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                getLogger().warning("Delivery poll failed with HTTP " + response.statusCode());
                return;
            }
            JsonObject root = JsonParser.parseString(response.body()).getAsJsonObject();
            if (root.get("job").isJsonNull()) return;
            JsonObject job = root.getAsJsonObject("job");
            String id = job.get("id").getAsString();
            String player = job.get("player").getAsString();
            JsonArray commands = job.getAsJsonArray("commands");
            Bukkit.getScheduler().runTask(this, () -> executeJob(id, player, commands));
        } catch (Exception exception) {
            getLogger().warning("Unable to poll delivery queue: " + exception.getMessage());
        } finally {
            polling.set(false);
        }
    }

    private void executeJob(String id, String player, JsonArray commands) {
        boolean success = true;
        StringBuilder details = new StringBuilder();
        if (Bukkit.getPlayerExact(player) == null) {
            // Console commands such as LuckPerms can target offline players.
            getLogger().info("Delivering purchase for " + player + " (player may be offline).");
        }
        for (int i = 0; i < commands.size(); i++) {
            String command = commands.get(i).getAsString().trim();
            if (command.isEmpty() || command.startsWith("/")) continue;
            try {
                boolean accepted = Bukkit.dispatchCommand(Bukkit.getConsoleSender(), command);
                if (!accepted) {
                    success = false;
                    details.append("Command was not accepted: ").append(command).append("; ");
                }
            } catch (Exception exception) {
                success = false;
                details.append(exception.getMessage()).append("; ");
            }
        }
        reportResult(id, success, details.length() == 0 ? "Commands dispatched" : details.toString());
    }

    private void reportResult(String id, boolean success, String detail) {
        Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
            try {
                JsonObject body = new JsonObject();
                body.addProperty("success", success);
                body.addProperty("detail", detail);
                HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/api/bridge/jobs/" + id + "/result"))
                        .timeout(Duration.ofSeconds(10))
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(body.toString())).build();
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() != 200) getLogger().severe("Could not report delivery " + id + ": HTTP " + response.statusCode());
                else if (getConfig().getBoolean("logging.enabled", true)) getLogger().info("Delivery " + id + " result: " + (success ? "success" : "failed"));
            } catch (Exception exception) {
                getLogger().severe("Could not report delivery " + id + ": " + exception.getMessage());
            }
        });
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!command.getName().equalsIgnoreCase("cubesmpbridge")) return false;
        if (!sender.hasPermission("cubesmpbridge.admin")) {
            sender.sendMessage("You do not have permission.");
            return true;
        }
        if (args.length == 1 && args[0].equalsIgnoreCase("reload")) {
            reloadConfig();
            if (!loadSettings()) {
                sender.sendMessage("Invalid website URL or API key. Check config.yml.");
                return true;
            }
            startPolling();
            sender.sendMessage("CubeSMP Bridge configuration reloaded.");
            return true;
        }
        sender.sendMessage("Usage: /cubesmpbridge reload");
        return true;
    }

    @Override
    public void onDisable() {
        if (pollTask != null) pollTask.cancel();
    }
}
