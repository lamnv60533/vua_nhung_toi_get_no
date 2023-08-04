import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:guide_infra_web_ui/models/infra_ui.dto.dart';
import 'package:guide_infra_web_ui/services/api.dart';
import 'package:guide_infra_web_ui/services/logger.dart';

class PipelineService {
  final SERVER_URL = dotenv.env['SERVER_HOST'];
  final logger = LogService().logger;

  Future<List<InfrastructureBranchModel>> getAllEnv() async {
    var baseUrl = "$SERVER_URL/dynamodb";
    final api = Api().api;
    var response = await api.get(baseUrl);
    if (response.statusCode == 200) {
      // try {
      List<InfrastructureBranchModel> temp = [];

      response.data.forEach((item) {
        var t = InfrastructureBranchModel.fromJson(item);
        temp.add(t);
      });
      return temp;
    }
    return [];
  }
}
