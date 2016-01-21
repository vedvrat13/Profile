import React from "react";

const VideoListItem = ({video, onVideoSelect}) => {

    return(
        <li className="ideo-item list-group-item" onClick={() => onVideoSelect(video)}>
            <div className="media">
                <div className="media-left">
                    <img className="media-object" src={video.snippet.thumbnails.default.url} />
                </div>
                <div className="media-body">
                    <div className="media-heading">
                    {video.snippet.title}
                    </div>
                </div>
            </div>
        </li>
    );
};

export default VideoListItem;
