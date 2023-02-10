console.log(`1`);


function info() {
    console.info(`2`);
}

export default class People {
    say () {
        console.debug(3);
    }
    render () {
        return <div>{ console.error(4) }</div>
    }
}
