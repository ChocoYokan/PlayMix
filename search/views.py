from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from django.db import models
from lyricsgenius import Genius
from spotipy.oauth2 import SpotifyClientCredentials
from googleapiclient.discovery import build
from django.core.serializers import serialize
import copy
import requests
import json
import pprint
import spotipy


# PlayMix用の認証IDと秘密鍵
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=settings.SPOTIFY_CLIENT_ID,
                                                           client_secret=settings.SPOTIFY_CLIENT_ID))
# Geniusのトークン
client_access_token = settings.SPOTIFY_CLIENT_SEACRET

# Create your models here.

def search(request):
    youtube = youtube_search(request)
    nikoniko = nikoniko_search(request)
    spotify = sp_info(request)
    result = {}
    results = []
    for i in range(len(nikoniko['data'])):
        result["title"] = nikoniko['data'][i]['title']
        result["url"] = "https://www.nicovideo.jp/watch/" + nikoniko['data'][i]['contentId']
        result["thumb"] = nikoniko['data'][i]['thumbnailUrl']
        result["content_type"] = "nikoniko"
        results.append(copy.copy(result))

    for i in range(len(youtube)):
          result['title'] = youtube[i]['title']
          result['url'] = "https://www.youtube.com/watch?v=" + youtube[i]['videoId']
          result['thumb'] = youtube[i]['thumb']
          result['content_type'] = "youtube"
          results.append(copy.copy(result))

    for i in range(len(spotify)):
          result['title'] = spotify[i]['title']
          result['url'] = spotify[i]['url']
          result['thumb'] = spotify[i]['thumb']
          result['content_type'] = "spotify"
          results.append(copy.copy(result))

    final_result = {"results" : results}
    # pprint.pprint(final_result)
    return JsonResponse(final_result)


def youtube_api(request) -> JsonResponse:
    search_word = request.GET.get("w", None)
    # print(search_word)
    # print(settings.YOUTUBE_API_KEY)
    # search(search_word)
    result = {}
    return JsonResponse(status=200, data=result)

#----------------------------------------Youtube_API---------------------------------------------#

def youtube_search(word):
  youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)

  search_response = youtube.search().list(
    q=word,
    part="id,snippet",
    maxResults=5
  ).execute()

  videos = []
  video = {}

  for search_result in search_response.get("items", []):
    if search_result["id"]["kind"] == "youtube#video":
      video['title'] = search_result["snippet"]["title"]
      video['thumb'] = search_result['snippet']['thumbnails']['default']['url']
      video['videoId'] = search_result["id"]["videoId"]
      videos.append(copy.copy(video))
  return videos

#----------------------------------------nikoniko_search---------------------------------------------#

def nikoniko_search(word):
    headers = {
        'User-Agent': 'PlayMix',
    }

    params = (
        ('targets', 'title'),  # 動画のタイトル
        ('fields', 'contentId,title,thumbnailUrl'),  # 動画ID,タイトル，サムネイルurlを取得
        ('_sort', '-viewCounter'),  # 再生回数が多い順(先頭の-を+にすると少ない順になる)
        ('_offset', '0'),
        ('_limit', '5'),  # 表示する動画の数
        ('_context', 'PlayMix'),  # 使用するアプリの名前
    )

    data = {
    'q': word,  # 検索するワードの指定
      #  'filters[viewCounter][gte]': '10000'  #  マイリスト数が1000以上かつコメント数が1000以上のフィルタ
    }

    response = requests.get('https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search', headers=headers, params=params, data=data)
    result = response.json()
    return result

#----------------------------------------Spotify_API---------------------------------------------#

def sp_info(query: str):
    # q = 検索文字,limit = 件数
    results = sp.search(q=query, limit=1)
    musics = []
    music = {}
    # track_name = 曲名, artist = アーティスト名, album = アルバム名, image_url = ジャケットのurl，
    for track in results['tracks']['items']:
        music['title'] = track['name']
        music['artist'] = track['artists'][0]['name']
        music['album'] = track['album']['name']
        music['thumb'] = track['album']['images'][0]['url']
        music['url'] = track['external_urls']['spotify']
        musics.append(copy.copy(music))
    return musics
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
