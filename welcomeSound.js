registerPlugin({
    name: 'WelcomeSound',
    version: '1.0',
    description: 'Plays a random track from a specific playlist when a user joins the bot\'s channel.',
    author: 'Zoltan Vagany mail@vaganyzoltan.hu',
    vars: [{
        name: 'playlistName',
        title: 'Playlist Name (The exact name of the playlist containing your sounds)',
        type: 'string'
    },
    {
        name: 'onlyWhenIdle',
        title: 'Only play if the bot is NOT currently playing music? (checkbox = yes)',
        type: 'boolean'
    }]
}, function(sinusbot, config) {
    var event = require('event');
    var backend = require('backend');
    var media = require('media');
    var engine = require('engine');

    event.on('clientMove', function(ev) {
        if (!ev.toChannel) return;

        // Check if the user is the bot itself (prevent loops)
        if (ev.client.isSelf()) return;

        var botChannel = backend.getCurrentChannel();
        if (!botChannel) return;

        //Check if the user joined the channel the bot is currently in
        if (ev.toChannel.id() != botChannel.id()) return;

        // If "onlyWhenIdle" is true, and the bot is playing, we do nothing.
        if (config.onlyWhenIdle && media.isPlaying()) return;

        if (config.playlistName) {
            var playlists = media.getPlaylists();
            var targetPlaylist = null;

            for (var i = 0; i < playlists.length; i++) {
                if (playlists[i].name() == config.playlistName) {
                    targetPlaylist = playlists[i];
                    break;
                }
            }

            if (targetPlaylist) {
                var tracks = targetPlaylist.getTracks();
                
                if (tracks && tracks.length > 0) {
                    // Pick a random index
                    var randomIndex = Math.floor(Math.random() * tracks.length);
                    var randomTrack = tracks[randomIndex];
                    engine.log('User joined. Picking random sound: ' + randomTrack.title());
                    randomTrack.play();
                } else {
                    engine.log('WelcomeSound: The specified playlist is empty.');
                }
            } else {
                engine.log('WelcomeSound: Could not find a playlist named "' + config.playlistName + '"');
            }
        } else {
            engine.log('WelcomeSound: No playlist name configured in settings.');
        }
    });
});
