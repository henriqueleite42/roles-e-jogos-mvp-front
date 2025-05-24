import { UploadKind, UploadUrl } from "@/types/api"

export interface UploadImageInput {
	ImageBlob: Blob
	FileName: string
	Kind: UploadKind
}

export async function uploadImage({ FileName, Kind, ImageBlob }: UploadImageInput) {
	const ext = FileName.split(".").pop()

	const responseReqUrl = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploads/request`, {
		method: "POST",
		body: JSON.stringify({
			Kind: Kind,
			Ext: ext,
		}),
		headers: { 'Content-Type': 'application/json' },
		credentials: "include"
	})

	if (!responseReqUrl.ok) {
		console.error(await responseReqUrl.text())
		throw new Error(`Fail to request upload ${responseReqUrl.status}`)
	}

	const res = await responseReqUrl.json() as UploadUrl

	var headers: HeadersInit | undefined
	const body = new FormData()

	if (res.Headers) {
		headers = JSON.parse(res.Headers)
	}
	if (res.Values) {
		const entries = Object.entries(JSON.parse(res.Values))
		entries.forEach(([key, value]) => {
			body.append(key, value as string)
		})
	}

	body.append("file", ImageBlob)

	const responseUpload = await fetch(res.Url, {
		method: res.Method,
		body: body,
		headers: headers
	})

	if (!responseUpload.ok) {
		console.error(await responseUpload.text())
		throw new Error(`Fail to upload img ${responseUpload.status}`)
	}

	return {
		FilePath: res.FilePath
	}
}