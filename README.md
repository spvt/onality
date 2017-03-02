[Twitter]: https://dev.twitter.com/docs
[IBM Watson]: https://developer.ibm.com/watson/
[Bing]: https://www.bing.com/partners/developers

# Onality

##Description
We use linguistic analysis to identify emotions. Simply type in a topic and we'll show you how people are feeling about it in real time. For example, type in 'Donald Trump as President' and you'll get an interesting read on how people are feeling about that. 

##Getting Started
1. Get your [Twitter][] API key, [IBM Watson][] API key's, and a [Bing][] API key. For IBM Watson, you'll need both the Tone Analyzer and AlchemyNews API keys
2. Clone repo to your machine
3. In newly created folder, run the following commands:
  - 'npm install'
  - 'npm start'
4. Inside of the api directory on the root level, change the name of the "apiKeys_demo.js" file to "apiKeys.js". Inside of your new apiKeys.js file, replace the values in the keys object with your own API keys

##Assumptions
1. UI
  - I used Material design from Google to layout the components. For V1, this simple grid system is familiar for most people and should be easy to use. 
2. API's
	- This app heavily relies on API's. For the free developer accounts, there are limitations to watch out for such as Twitter limits searches to 100 for free accounts and IBM has 30 day trials. 
3. Server/Controller
  - Every API call is handled with Promises. Twitter, IBM Watson's AlchemyNews, and Bing all rely on the search term that the user inputs. IBM Watson's Tone Analyzer depends on Twitter's data.
