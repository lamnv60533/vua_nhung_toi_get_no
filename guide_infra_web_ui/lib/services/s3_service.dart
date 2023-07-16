import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:guide_infra_web_ui/models/infra_ui.dto.dart';
import 'package:guide_infra_web_ui/services/api.dart';

class S3Service {
  // ignore: non_constant_identifier_names
  final SERVER_URL = dotenv.env['SERVER_HOST'];
  final api = Api().api;

  Future<List<OptionModel>> getAllCategory() async {
    var baseUrl = "$SERVER_URL/s3";
    var response = await api.get(baseUrl);

    if (response.statusCode == 200) {
      List<OptionModel> tmp = [];
      response.data.forEach((dynamic item) {
        final mapObject = item as Map<String, dynamic>;
        var t = OptionModel(code: mapObject["index"], name: mapObject["value"]);
        tmp.add(t);
      });
      return tmp;
    }
    return [];
  }
}
