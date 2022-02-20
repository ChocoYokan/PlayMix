import requests
import spotipy
from django.conf import settings
from django.shortcuts import render
from lyricsgenius import Genius
from spotipy.oauth2 import SpotifyClientCredentials

# PlayMix用の認証IDと秘密鍵
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=settings.SPOTIFY_CLIENT_ID,
                                                           client_secret=settings.SPOTIFY_CLIENT_ID))
# Geniusのトークン
client_access_token = settings.SPOTIFY_CLIENT_SEACRET

#----------------------------------------Spotify_API---------------------------------------------#


def sp_info(query: str):
    # q = 検索文字,limit = 件数
    results = sp.search(q=query, limit=1)

    # track_name = 曲名, artist = アーティスト名, album = アルバム名, image_url = ジャケットのurl，
    for track in results['tracks']['items']:
        track_name = track['name']
        artist = track['artists'][0]['name']
        album = track['album']['name']
        image_url = track['album']['images'][0]['url']

        # print(track_name, artist, album, image_url)
    # 歌詞を表示
    # sp_lyrics(artist, track_name)

#----------------------------------------Genius_API(歌詞出力）------------------------------------#


def sp_lyrics(artist_name, track_name):
    genius_search_url = f"https://api.genius.com/search?q={artist_name}&access_token={client_access_token}"
    response = requests.get(genius_search_url)
    genius = Genius(client_access_token)
    song = genius.search_song(artist_name, track_name)
    if song == None:
        print("None")
    else:
        print(song.lyrics)
