const discord = require('discord.js');
const open = require('open');
const bot = new discord.Client();
const ytdl = require('ytdl-core');
const token = '<REDACTED>';

const prefix = '.';

var servers = {};

bot.once('ready', () => {
    console.log('Bot init done.');
    console.log('Bot on');
});

bot.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    var adminRole;

    if (args[0] === 'help'){
        const helpEmbed = new discord.MessageEmbed()
	       .setColor('#ad221f')
	          .setTitle('ArielBot Commands:')
	                         .addFields(
		{ name: '.site', value: 'Opens ARIEL3D website. Roles needed: None.' },
		{ name: '.stuck <Search Query>', value: 'Searches something on stackoverflow. Roles needed: None.' },
        { name: '.setadminrole <New Role Name>', value: 'Sets new admin role for admin args use. Permissions needed: Manage Roles on current channel.' },
        { name: 'Music', value: 'Music commands below.' },
        { name: 'Play <YouTube URL>', value: 'Plays the audio of the URL you mention. Roles needed: None.', inline: true },
        { name: 'Skip', value: 'Skips current song playing and starts next song in queue. Roles needed: None.', inline: true },
        { name: 'Stop', value: 'Stops music and leaves current channel. Roles needed: None.', inline: true },
	)
	.setTimestamp()

    message.channel.send(helpEmbed);
} else if (args[0] === 'site') {
        message.channel.send('Site not operational yet...');
        // open('https://ariel3d.net/');
        return;
    } else if (args[0] === 'stuck') {
        var responce = message.content.replace(/.stuck /, '');
        const target = 'https://stackoverflow.com/search?q=' + responce;
        message.channel.send(target.replace(/ /g, '%20'));
        open(target);
        return;
    } else if (args[0] === 'setadminrole' && message.channel.permissionsFor(message.member).has("MANAGE_ROLES_OR_PERMISSIONS", true)){
        var responceTwo = message.content.replace('.setadminrole ', '');
        adminRole = responceTwo;
        return;
    } else if (args[0] === 'setadminrole' && message.channel.permissionsFor(message.member).has("MANAGE_ROLES_OR_PERMISSIONS", false)){
        message.channel.send('You must have the Manage Roles permission to do this args successfully...');
        return;
    } else if (args[0] === 'play'){
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
                play(connection, message);
            });
        }
    } else if (args[0] === 'skip'){
        var server = servers[message.guild.id];
        if (server.dispatcher){
            server.dispatcher.end();
        }
        message.channel.send('Skipping the current song...');
    } else if (args[0] === 'stop'){
        var server = servers[message.guild.id];
        if (message.guild.voiceConnection){
            for (var i = server.queue.length -1; i >= 0; i--){
                server.queue.splice(i, 1);
            }
            server.dispatcher.end();
            if (message.guild.voice.connection){
                message.guild.voice.connection.disconnect();
            }
            message.channel.send('Stopped the music and left the channel...');
        }
    } else if (args[0] === 'queue'){
        var server = servers[message.guild.id];
        message.channel.send('There are ' + server.queue.length + ' songs in the queue currently...');
    }
});

bot.login(token);
