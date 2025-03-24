//

const map = ({ from, to, progress }) => {
    // return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    return from + (to - from) * progress;
};

//
//
export default map;
//
//
