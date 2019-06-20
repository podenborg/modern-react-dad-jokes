import React, { Component } from 'react';
import axios from 'axios';

import Joke from './Joke';
import './JokeList.css';

class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    }
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]")
        };
        this.seenJokes = new Set(this.state.jokes.map(j => j.id));
        this.fetchJokes = this.fetchJokes.bind(this);
        this.handleVote = this.handleVote.bind(this);
        this.handleFetch = this.handleFetch.bind(this);
    }
    componentDidMount() {
        if (this.state.jokes.length === 0) {
            this.fetchJokes();
        }
        console.log(this.seenJokes);
    }
    handleVote(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j =>
                j.id === id ? { ...j, votes: j.votes + delta } : j
            )
        }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
    }
    async fetchJokes() {
        try {
            const API_URL = "https://icanhazdadjoke.com/";
            let jokes = [];

            while (jokes.length < this.props.numJokesToGet) {
                let res = await axios.get(API_URL, { 
                    headers: { Accept: 'application/json'}
                });
                let newJoke = {
                    id: res.data.id,
                    joke: res.data.joke,
                    votes: 0
                };
                if (!this.seenJokes.has(newJoke.id)) {
                    jokes.push(newJoke);
                } else {
                    console.log("Duplicate!");
                }
            }

            this.setState(st => ({
                loading: false,
                jokes: [...st.jokes, ...jokes]
            }), () => window.localStorage.setItem("jokes", JSON.stringify(jokes)));
        } catch (error) {
            alert(error);
        }
    }
    handleFetch() {
        this.setState({ loading: true }, this.fetchJokes);
    }
    render() {
        const jokes = this.state.jokes.map(j => 
            <Joke
                id={j.id}
                key={j.id}  
                text={j.joke}
                votes={j.votes}
                upVote={() => this.handleVote(j.id, 1)}
                downVote={() => this.handleVote(j.id, -1)}  
            />
        )
        if (this.state.loading) {
            return (
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="JokeList-title">Loading</h1>
                </div>
            )
        }
        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">
                        <span>Dad</span> Jokes
                    </h1>
                    <img src={"https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"}/>
                    <button className="JokeList-getmore" onClick={this.handleFetch}>
                        More Jokes!
                    </button>
                </div>
                <div className="JokeList-jokes">
                    {jokes}
                </div>
            </div>
        );
    }
}

export default JokeList;