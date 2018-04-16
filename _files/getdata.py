import csv
import re

import requests
from bs4 import BeautifulSoup


# Convert dates in string format into natural form
def str2date(strdate):
    year = strdate.split(',')[1].strip()
    date = strdate.split(',')[0].strip().split(' ')[1]
    month = strdate.split(',')[0].strip().split(' ')[0]

    monthstr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthnum = monthstr.index(month) + 1

    strval = str(year) + '-' + str(monthnum) + '-' + str(date)

    return strval

# Method to increment the selector
def update_base():
    global curselector
    curselector = curselector.findNext('div')
    return curselector


# with open('dataanime.csv', 'w') as f:
#     writer = csv.writer(f)
#     writer.writerow(['Title','Type','Episodes','Status','Start airing','End airing','Starting season','Broadcast time','Producers','Licensors','Studios','Sources','Genres','Duration','Rating','Score','Scored by','Members','Favorites','Description'])


location = "https://myanimelist.net/topanime.php?limit="
for page in range(30, 34):
    anistart = page * 50
    # -Parent- get request
    getreq = requests.get(location + str(anistart))
    # -Parent- parser
    soup = BeautifulSoup(getreq.text, 'html.parser')
    # -Parent- selector
    ranklist = soup.select('tr.ranking-list')

    datatotal = []
    for idx, row in enumerate(ranklist):
        data = []
        # Title
        title = row.select('div.di-ib.clearfix > a')[0].text.encode('utf-8')
        # Anchor for particular title
        anchor = row.select('div.di-ib.clearfix > a')[0]['href']

        # -Child- get request
        newreq = requests.get(anchor)
        # -Child- parser
        newsoup = BeautifulSoup(newreq.text, 'html.parser')

        # INFORMATION
        baseselector = newsoup.find_all(text=re.compile('Type:'))[0].parent.parent
        curselector = baseselector

        # Type
        try:
            type = baseselector.select('a')[0].text
        except:
            type = baseselector.text.split('\n')[2].strip()
        # Episodes
        episodes = update_base().text.split('\n')[2].strip()
        # Status
        status = update_base().text.split('\n')[2].strip()
        # Start and End airing dates
        airing = update_base().text.split('\n')[2].strip()
        try:
            start_airing = str2date(airing.split('to')[0].strip())
        except:
            start_airing = '-'
        try:
            end_airing = str2date(airing.split('to')[1].strip())
        except:
            end_airing = '-'
        # Starting season and Broadcasting time
        if type != 'TV':
            start_season = '-'
            broadcasttime = '-'
        else:
            start_season = update_base().select('a')[0].text.split(' ')[0]
            broadcasttime = update_base().text.split('\n')[2].strip()
        # Producers
        prod = update_base().select('a')
        producers = ','.join([i.text.encode('utf-8') for i in prod])
        # Licensors
        lic = update_base().select('a')
        licensors = ','.join([i.text.encode('utf-8') for i in lic])
        # Studios
        stud = update_base().select('a')
        studios = ','.join([i.text.encode('utf-8') for i in stud])
        # Sources
        sources = update_base().text.split('\n')[2].strip()
        # Genres
        gen = update_base().select('a')
        genres = ','.join([i.text for i in gen])
        # Duration
        duration = update_base().text.split('\n')[2].strip()
        # Rating
        rating = update_base().text.split('\n')[2].strip()

        # STATISTICS
        baseselector = newsoup.find_all("div", {"itemprop": "aggregateRating"})[0]
        curselector = baseselector

        # Score
        score = baseselector.select('span')[1].text
        # Scored by
        num_score = baseselector.select('span')[2].text

        # skip some divs
        update_base()
        update_base()
        update_base()
        update_base()

        # Members
        members = update_base().text.split('\n')[2].strip()
        # Favorites
        favorites = update_base().text.split('\n')[2].strip()

        # Description
        try:
            description = newsoup.findAll("span", {"itemprop": "description"})[0].text.encode('utf-8')
        except:
            description = '-'
        # print title, type, episodes,status, start_airing, end_airing, start_season, broadcasttime,producers, licensors, studios

        print str(anistart + idx + 1) + ' - ' + title
        data.append(
            [title, type, episodes, status, start_airing, end_airing, start_season, broadcasttime, producers, licensors,
             studios, sources, genres, duration, rating, score, num_score, members, favorites, description])
        datatotal.extend(data)

    with open('dataanime.csv', 'a') as f:
        writer = csv.writer(f)
        writer.writerows(datatotal)
