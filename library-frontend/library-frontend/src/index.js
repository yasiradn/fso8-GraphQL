import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache} from '@apollo/client' 

ReactDOM.render(<App />, document.getElementById('root'))