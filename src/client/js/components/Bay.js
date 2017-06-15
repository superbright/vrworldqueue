import React, {
    Component
}
from 'react';
import io from 'socket.io-client';
class Bay extends Component {
    constructor() {
        super();
        this.state = {
            bay: null
            , socket: null
            , queue: []
        };
    }
    componentWillMount() {
        const {
            match: {
                params: {
                    bayid
                }
            }
        } = this.props;
        return fetch(`/api/bays/${bayid}`, {
            method: 'get'
        , }).then(res => res.json()).then((bay) => {
            this.setState({
                bay, socket: io('http://localhost:3000', {
                    query: `clientType=queue&clientId=${bayid}`
                })
            });
            this.connectSocket();
        }).catch((err) => {
            console.log('error', err);
        });
    }
    connectSocket() {
        const {
            socket
        } = this.state;
        if (socket) {
            console.log('--', socket);
            socket.on('queue', (res) => {
                console.log('Queue Message', res);
                this.setState({
                    queue: res
                });
            });
        }
    }
    render() {
            const {
                bay
                , queue
            } = this.state;
            const {
                match: {
                    params: {
                        bayid
                    }
                }
            } = this.props;
            return ( < div key = {
                        bayid
                    } > {
                        bay && ( < div > < header className = "flex space-between align-center" > < h5 > {
                                bay.name
                            } < /h5> < /header > {
                                queue.length === 0 ? ( < div className = "simple-container user-search" > < h3 > {
                                    'There\'s no one in line, register now!'
                                } < /h3></div > ) : ( < ul > {
                                        queue.map(player => ( < li className = "user-list-item flex space-between align-center" > < div > {
                                            player.screenname
                                        } < /div> < /li > ))
                                    } < /ul>)
                                } < /div>)
                            } < /div>);
                        }
                    }
                    export default Bay;