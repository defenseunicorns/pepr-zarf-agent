package server

import (
	"context"

	pb "github.com/cmwylie19/pepr-zarf-agent/transformer/api/v1/image"
	"github.com/defenseunicorns/zarf/src/pkg/transform"
)

type ImageTransformServer struct {
	pb.UnimplementedImageTransformServer
}

func NewImageTransformServer() *ImageTransformServer {
	return &ImageTransformServer{}
}

func (s *ImageTransformServer) ImageTransformHost(ctx context.Context, in *pb.TransformRequest) (*pb.TransformResponse, error) {
	if image_str, err := transform.ImageTransformHost(in.TargetHost, in.SrcReference); err != nil {
		return nil, err
	} else {
		return &pb.TransformResponse{TransformedImage: image_str}, nil
	}
}

func (s *ImageTransformServer) ImageTransformHostWithoutChecksum(ctx context.Context, in *pb.TransformRequest) (*pb.TransformResponse, error) {
	if image_str, err := transform.ImageTransformHostWithoutChecksum(in.TargetHost, in.SrcReference); err != nil {
		return nil, err
	} else {
		return &pb.TransformResponse{TransformedImage: image_str}, nil
	}
}
