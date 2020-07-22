const discord = require('discord.js');
const open = require('open');
const bot = new discord.Client();
const ytdl = require('ytdl-core');
const token = '<REDACTED>';

const prefix = '.';

var servers = {};

bot.once('ready', () => {
    console.log('Bot on.');
});

bot.on('message', message => {
    function embed(title, desc, time){
        var embeds = new discord.MessageEmbed()
           .setColor('#ad221f')
              .setTitle(title)
                 .setDescription(desc);
                 if (time) embeds.setTimestamp();


        message.channel.send(embeds);
    }

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    var adminRole;

    if (args[0] === 'help'){
        console.log(message.author + ' did the `.help` command...');
        const helpEmbed = new discord.MessageEmbed()
	       .setColor('#ad221f')
	          .setTitle('ArielBot(Beta) Commands:')
                    .setThumbnail('https://i.ibb.co/DQW2NhM/ARIEL3-D-Trans-Title.png')
	                         .addFields(
		{ name: '.site', value: 'Opens ARIEL3D website.' },
        { name: '.servers', value: 'Lists partered and self servers.' },
        { name: '.games', value: 'Opens Itch.IO website to ArielBot creators profile.' },
		{ name: '.stuck <Search Query>', value: 'Searches something on stackoverflow.' },
        { name: '.timer <Number> <h/m/s>', value: 'A typical timer.' },
        { name: '.setMaxTimer <Number>', value: 'Sets the max time someone could use in the timer command. Perms needed: Administrator.' },
        { name: 'Music', value: 'Music commands below.' },
        { name: '.play <YouTube URL>', value: 'Plays the audio of the URL you mention.', inline: true },
        { name: '.skip', value: 'Skips current song playing and starts next song in queue.', inline: true },
        { name: '.stop', value: 'Stops music and leaves current channel.', inline: true },
	)
	.setTimestamp()

    message.channel.send(helpEmbed);
} else if (args[0] === 'site') {
    console.log(message.author + ' did the `.site` command...');
        message.channel.send('Site not operational yet...');
        // open('https://ariel3d.net/');
        return;
    } else if (args[0] === 'stuck') {
        console.log(message.author + ' did the `.stuck` command...');
        var responce = message.content.replace(/.stuck /, '');
        const target = 'https://stackoverflow.com/search?q=' + responce;
        message.channel.send(target.replace(/ /g, '%20'));
        open(target);
        return;
    } else if (args[0] === 'play'){
        console.log(message.author + ' did the `.play` command...');
        function play(connection, message){
            var server = servers[message.guild.id];

            server.dispatcher = connection.play(ytdl(server.queue[0], {filter: ('audioonly')}));
            server.queue.shift();
            server.dispatcher.on('end', function(){
                if (server.queue[0]){
                    play(connection, message);
                } else {
                    connection.disconnect();
                }
            });
        }

        if (!args[1]){
            message.channel.send('No music link provided in the first argument...');
            return;
        }

        if (!args[1].includes('https://')){
            message.channel.send('No music link provided in the first argument...');
            return;
        }

        if (!message.member.voice.channel){
            message.channel.send('You must be in a voice channel to play music...');
            return;
        }
        if (!servers[message.guild.id]) servers[message.guild.id] = {
            queue: []
        }
        var musicURL = args[1];
        var server = servers[message.guild.id];
        server.queue.push(args[1]);
        if (!message.guild.voiceConnection){
            message.member.voice.channel.join().then(function(connection){
                ytdl.getInfo(musicURL, function(err, info) {
                    var musicName = info.videoDetails.title;
                    console.log(info.videoDetails.title);
                    embed('Now Playing:', musicName, true);
                });
                play(connection, message);
            });
        }
    } else if (args[0] === 'skip'){
        console.log(`${message.author} + ' did the '.skip' command...`);
        var server = servers[message.guild.id];
        if (server.queue[1] == null){
            message.channel.send('No song to skip to...');
        } else if (server.dispatcher){
            server.dispatcher.end();
            message.channel.send('Skipping the current song...');
        }
    } else if (args[0] === 'stop'){
        console.log(`${message.author} did the '.stop' command...`);
        var server = servers[message.guild.id];
        if (message.guild.voice.connection){
            server.dispatcher.end();
            message.guild.voice.connection.disconnect();
            message.channel.send('Stopped the music and left the channel...');
        } else {
            message.channel.send('No music playing...');
        }
    } else if (args[0] === 'queue'){
        console.log(`${message.author} did the '.queue' command...`);
        var server = servers[message.guild.id];
        message.channel.send('There are ' + server.queue.length + ' songs in the queue currently...');
    } else if (args[0] === 'timer'){
        console.log(message.author + ' did the `.timer` command...');
        var timeAmount = parseInt(args[1]);
        var maxTime = 1000;
        if (timeAmount > maxTime){
            message.channel.send('Your timer goes over the limit...');
            return;
        }
        if (args[2] === 'h'){
            setTimeout(function(){
                message.channel.send(`${message.author}, your timer has finished...`);
            }, timeAmount * 3600000);
        } else if (args[2] === 'm'){
            setTimeout(function(){
                message.channel.send(`${message.author}, your timer has finished...`);
            }, timeAmount * 60000);
        } else if (args[2] === 's'){
            console.log(message.author + ' did the `.timer s` command...');
            setTimeout(function(){
                message.channel.send(`${message.author}, your timer has finished...`);
            }, timeAmount * 1000);
        } else {
            message.channel.send("You've used the `.timer` command wrong. Refer to `.help`...");
        }

    } else if (args[0] === 'setMaxTimer'){
        console.log(`${message.author} did the '.setMaxTimer' command...`);
        if (message.channel.permissionsFor(message.author).has("ADMINISTRATOR")){
            maxTime = parseInt(args[1]);
            message.channel.send('Maximum timer time changed...');
        } else {
            message.channel.send('You are not allowed to do this command...');
        }
    } else if (args[0] === 'bugFixed'){
        // Dev stage command
        if (message.author == '513871967296946186') { embed('ArielBot Bug Fixed!', '', true); }
        else { message.channel.send('You are not allowed to do this command...'); }
    } else if (args[0] === 'games'){
        open('https://alex-skeleton.itch.io/');
        embed('Play my games!:', 'https://alex-skeleton.itch.io/', true);
    } else if (args[0] === 'servers'){
        var serversEmbed = new discord.MessageEmbed()
        .setTitle('Recommended Severs:')
        .setColor('#ad221f')
        .addFields(
            { name: 'Testing Server:', value: 'https://discord.gg/PCWvBsW' },
            { name: 'ARIEL3D Server:', value: 'https://discord.gg/WS6ar3r' },
        )
        .setTimestamp();
        message.channel.send(serversEmbed);
    } else if (args[0] === 'embed'){
        // Dev stage command
        if (message.author == '513871967296946186') {
            var embedTimestamp = true;
            if (args[3] == 't'){
                embedTimestamp = true;
            } else {
                embedTimestamp = false;
            }
            embed(args[1].replace(/"/g, ''), args[2].replace(/"/g, ''), embedTimestamp);
        }
        else {
            message.channel.send('You are not allowed to do this command...');
        }
    }
});

bot.login(token);
